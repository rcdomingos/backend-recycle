const logger = require('../../utils/winston');
const CollectorModels = require('../models/collector.models');
const UsersModels = require('../models/users.models');

/**Função para gerar o status do cadastro */
const createStatusCollector = (code) => {
  let description;

  switch (code) {
    case 1:
      description = 'Aguardando Aprovação';
      break;
    case 2:
      description = 'Aprovado';
      break;
    case 3:
      description = 'Rejeitado';
      break;
    case 4:
      description = 'Informações Pendentes';
      break;
    default:
      description = 'Codigo Não identificado';
      break;
  }

  return {
    status: {
      code: code,
      description: description,
    },
  };
};

const url = process.env.URL || process.env.LOCAL_URL;

/**
 * Classe com os metodos utilizado para as solcitações dos Coletores
 */
class CollectorController {
  /**
   * Metodo utilizado para adicinar o coletor no pre-coletores
   */
  static async apiAddCollector(req, res) {
    try {
      const userIdJWT = req.userJwt.userId;
      const userNameJWT = req.userJwt.name;
      const collectionLocations = req.body.collectionLocations;
      const vehicle = req.body.vehicle;

      const { status } = createStatusCollector(1);

      let data = {
        userName: userNameJWT,
        collectionLocations: collectionLocations,

        vehicle: Array.isArray(vehicle) ? vehicle : Array(vehicle),
        createdDate: new Date(),
        status,
      };

      const resultAddCollector = await CollectorModels.addCollector(
        userIdJWT,
        data
      );

      if (resultAddCollector.sucess) {
        res.status(200).json({
          code: 200,
          message: `Enviado com Sucesso`,
          description: `Solicitação aguardando a aprovação`,
        });
        return;
      }

      res.status(500).json({
        code: 500,
        message: resultAddCollector.error,
        description: resultAddCollector.description,
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
   *  Metodo para listar todos os usuarios cadastrados como pre-coletores
   */
  static async apiGetAllPreCollector(req, res) {
    try {
      const collectorsList = await CollectorModels.getAllPreCollector();

      collectorsList.map((collector) => {
        collector.Links = [
          {
            url: `${url}/api/v1/users/${collector.userId}`,
            Method: 'GET',
            Type: 'Details',
          },
          {
            url: `${url}/api/v1/collectors/${collector.userId}/status`,
            Method: 'PUT',
            Type: 'Action',
          },
        ];
      });

      res.status(200).json({ collectorsList });
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
   * Metodo para listar as informações de um usuario
   */
  static async apiGetStatusPreCollector(req, res) {
    try {
      const userId = req.params.id;

      const resultFind = await CollectorModels.getStatusPreCollector(userId);

      res.json(resultFind);
    } catch (e) {
      logger.error(e, { label: 'Express' });
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }

  /**
   * Metodo para deletar a solicitação de coletor
   */
  static async apiDeletePreCollector(req, res) {
    try {
      const userId = req.params.id;

      const resultDelete = await CollectorModels.deletePreCollector(userId);

      console.log(resultDelete);

      if (resultDelete.sucess) {
        res.status(204).send();
      } else {
        res.status(404).json({
          code: 404,
          message: resultDelete.error,
          description: resultDelete.description,
        });
      }
    } catch (e) {
      logger.error(e, { label: 'Express' });
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }

  /**
   * Metodo para alterar o status da solicitação do pre-coletor
   */
  static async apiAlterStatusPreCollector(req, res) {
    const newStatus = req.body.statusTo;
    const userId = req.params.id;
    const infoStatus = createStatusCollector(newStatus);
    const statusValidos = [1, 2, 3, 4, 5];
    const userIdJWT = req.userJwt.userId;
    const userNameJWT = req.userJwt.name;

    try {
      if (statusValidos.includes(newStatus)) {
        const resultStatus = await CollectorModels.alterStatusPreCollector(
          userId,
          infoStatus
        );

        if (!resultStatus) {
          res.status(500).json({
            code: 500,
            message: `Erro interno, por favor tente mas tarde`,
            description: `Não foi possivel alterar o status da solicitação`,
          });
          return;
        }

        /** adicionar os dados na coleção users quando aprovado */
        if (newStatus === 2) {
          let data = {
            approvedById: userIdJWT,
            collectorDate: new Date(),
            collectionLocations: resultStatus.collectionLocations,
            vehicle: resultStatus.vehicle,
            isCollector: true,
          };

          const resultAlterUser = await UsersModels.alterUser(userId, data);

          if (resultAlterUser.modifiedCount == 0) {
            logger.error('Ocorreu um erro para alterar o usuario', {
              label: 'Express',
            });
            res.status(500).json({
              code: 500,
              message: `Erro interno, por favor tente mas tarde`,
              description: `${resultAlterUser.e}`,
            });
            return;
          }
        }

        res.status(200).json(infoStatus);
      } else {
        res.status(404).json({
          code: 404,
          message: `Informação invalida para alteração do Status`,
          description: `O status ${newStatus} informado não é valido, informar os codigos ${statusValidos}`,
        });
      }
    } catch (e) {
      logger.error(`${e}`, { label: 'Express' });
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }
}

module.exports = CollectorController;

// {
//   "collectionLocations": [
//       {
//           "city": "São Roque",
//           "neighbourhood": [
//               "Centro",
//               "Marmeleiro"
//           ]
//       }
//   ],
//   "vehicle": [
//       "Caminhão",
//       "Carro"
//   ]
// }
