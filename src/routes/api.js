import healthAPI from './health.api'
import authAPI from './auth.api'
import userAPI from './user.api'
import kpiAPI from './kpi.api'

module.exports = (router) => {
  router.param('user_id', userAPI.paramUserId)

  router.route('/health').get(healthAPI.healthCheck)
  router.route('/login').post(authAPI.login)
  router.route('/users/:user_id').get(userAPI.getUser)
  router.route('/kpi').get(kpiAPI.getKpi)
}
