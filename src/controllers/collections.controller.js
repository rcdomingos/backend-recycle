const logger = require('../../utils/winston');
const CollectModel = require('../models/collections.models');
const ObjectId = require('mongodb').ObjectID;
const dataCleaning = require('../../utils/dataCleaning');

/**Função para gerar o status do cadastro */
const createStatusCollect = (code) => {
  let description;

  switch (parseInt(code)) {
    case 1:
      description = 'Em Aberto';
      break;
    case 2:
      description = 'Aceita pelo Coletor';
      break;
    case 3:
      description = 'Coleta realizada com sucesso';
      break;
    case 4:
      description = 'Informações Pendentes';
      break;
    default:
      description = 'Codigo Não identificado';
      break;
  }

  return {
    code: parseInt(code),
    description: description,
  };
};

class CollectController {
  /**
   * Metodo para adicionar uma coleta
   */
  static async apiAddCollect(req, res) {
    let collectDataCleaning = {};
    let dataCollect = {};

    // preparando os dados que serão inseridos
    try {
      dataCollect.generatorId = ObjectId(req.userJwt.userId); //JWT

      //validação dos dados
      let error = {};

      if (!req.body.collectDate) {
        error.collectDate = 'É necessario informar a data da coleta';
      } else {
        dataCollect.collectDate = new Date(req.body.collectDate);
      }
      dataCollect.collectTime = req.body.collectTime;
      dataCollect.collectPhoto = req.body.collectPhoto;
      dataCollect.createdDate = new Date();
      dataCollect.generatorNote = req.body.generatorNote;

      /** validar o endereço */
      dataCollect.address = {};
      dataCollect.address.street = req.body.address.street;
      dataCollect.address.number = req.body.address.number;
      dataCollect.address.complement = req.body.address.complement;
      dataCollect.address.neighborhood = req.body.address.neighborhood;
      dataCollect.address.city = req.body.address.city;
      dataCollect.address.state = req.body.address.state;
      dataCollect.address.zip_code = req.body.address.zipCode;
      dataCollect.collectType = req.body.collectType;
      dataCollect.collectWeight = req.body.collectWeight
        ? parseFloat(req.body.collectWeight)
        : 0.0;

      dataCollect.status = createStatusCollect(1);

      /**Removendo os campos undefined */
      collectDataCleaning = await dataCleaning(dataCollect);

      if (Object.keys(error).length > 0) {
        res.status(400).json({
          error: 'Ocorreram erros na validações do formulario',
          description: error,
        });
        return;
      }
    } catch (e) {
      logger.error(`${e}`, { label: 'Express' });
      res.status(500).json({
        code: 500,
        message: `Ocorreu erro na tratativa dos dados`,
        description: `${e}`,
      });
    }
    // enviando os dados para o banco
    try {
      const resultAddCollect = await CollectModel.addCollect(
        collectDataCleaning
      );

      res.status(201).json({
        code: 201,
        message: `Coleta Agendada com sucesso`,
        description: `Coleta Agendada com sucesso`,
      });
    } catch (e) {
      logger.error(`${e}`, { label: 'Express' });
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }

  /**
   * Metodo para listar todas as coletas
   */
  //TODO: Listar as coleta do usuario JWT
  static async apiGetAllCollect(req, res) {
    try {
      let page = parseInt(req.query.page || 1);
      let limit = parseInt(req.query.limit || 10);
      let status = req.query.status || null;
      let generatorId = req.query.generator || null;

      let filter = { page, status, limit, generatorId };

      const {
        collectList,
        totalResults,
        count,
      } = await CollectModel.getAllCollect(filter);

      let response = {
        results: collectList,
        total_results: totalResults,
        page,
        count,
        limit,
      };

      res.status(200).json(response);
    } catch (e) {
      logger.error(`${e}`, { label: 'Express' });
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }

  /**
   * Metodo para listar uma coleta especifica
   */
  static async apiGetCollect(req, res) {
    try {
      const collectId = req.params.collectId;

      const listCollect = await CollectModel.getCollect(collectId);

      res.status(200).json(listCollect);
    } catch (e) {
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }
  /**
   * Metodo para Deletar uma Coleta especifica
   */
  static async apiDeleteCollect(req, res) {
    try {
      const collectId = req.params.collectId;

      const listCollect = await CollectModel.deleteCollect(collectId);

      if (listCollect.deletedCount > 0) {
        res.status(204).send();
      } else {
        res.status(404).json({
          code: 404,
          message: `Não foi possivel excluir o documento`,
          description: `O documento não esta disponivel ou ja foi excluido`,
        });
      }
    } catch (e) {
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }

  /**
   * Metodo para alterar os status da coleta (assumir)
   */
  static async apiAlterStatusCollect(req, res) {
    const collectId = req.params.collectId;
    const status = req.body.statusTo;

    let dataCollect = {};

    try {
      /**Aceitar a coleta */
      if (status == 2) {
        dataCollect.collectorId = req.userJwt.userId;
        dataCollect.aceptedDate = new Date();
      }

      /**Finalizar a coleta */
      if (status == 3) {
        dataCollection.collectedDate = new Date();
      }

      dataCollect.status = createStatusCollect(status);

      const resultAlterStatus = await CollectModel.alterStatusCollect(
        collectId,
        dataCollect
      );

      if (resultAlterStatus > 0) {
        res.status(201).json({
          code: 201,
          message: `Alteração realizada com sucesso`,
          description: `O status da coleta foi alterado para ${dataCollect.status.description}`,
        });
      } else {
        res.status(400).json({
          code: 400,
          message: `Não foi possivel alterar o status da solicitação`,
          description: `O recurso solicitado não estava disponivel para alteração`,
        });
      }
    } catch (e) {
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }

  /**
   * Metodo para listar o status da coleta especifica
   */
  static async apiGetStatusCollect(req, res) {
    try {
      const collectId = req.params.collectId;

      const infoStatus = await CollectModel.getStatusCollect(collectId);

      return res.status(200).json(infoStatus);
    } catch (e) {
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }

  /**
   * Metodo para alterar a coleta
   */
  static async apiAlterCollect(req, res) {
    const collectId = req.params.collectId;
    let dataCollect = {};
    let collectDataCleaning = {};

    /**validar se aleração pode ser alterada ou não pelo status */
    try {
      const statusCollect = await CollectModel.getStatusCollect(collectId);

      if (statusCollect.status.code != 1) {
        res.status(400).json({
          code: 500,
          message: `Não foi possivel alterar a coleta`,
          description: `Colleta com o status = ${statusCollect.status.description} não podem ser alteradas apenas excluida`,
        });
        return;
      }
    } catch (e) {
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
      return;
    }
    /**realizar a alteração */
    try {
      /**verificar os campos do form */
      if (req.body.collectDate) {
        dataCollect.collectDate = new Date(req.body.collectDate);
      }
      dataCollect.collectTime = req.body.collectTime;
      dataCollect.collectPhoto = req.body.collectPhoto;
      dataCollect.generatorNote = req.body.generatorNote;

      /** validar o endereço */
      dataCollect.address = {};
      dataCollect.address.street = req.body.address.street;
      dataCollect.address.number = req.body.address.number;
      dataCollect.address.complement = req.body.address.complement;
      dataCollect.address.neighborhood = req.body.address.neighborhood;
      dataCollect.address.city = req.body.address.city;
      dataCollect.address.state = req.body.address.state;
      dataCollect.address.zip_code = req.body.address.zipCode;
      dataCollect.collectType = req.body.collectType;
      dataCollect.collectWeight = req.body.collectWeight
        ? parseFloat(req.body.collectWeight)
        : 0.0;

      dataCollect.address = await dataCleaning(dataCollect.address);

      if (Object.keys(dataCollect.address).length == 0) {
        dataCollect.address = undefined;
      }

      dataCollect.alteredDate = new Date();

      /**Removendo os campos undefined */
      collectDataCleaning = await dataCleaning(dataCollect);

      const resultUpdate = await CollectModel.alterCollect(
        collectId,
        collectDataCleaning
      );

      res.status(200).json({ resultUpdate });
    } catch (e) {
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }
}

module.exports = CollectController;
