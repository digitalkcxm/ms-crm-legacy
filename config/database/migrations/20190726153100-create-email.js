module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('emails', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: Sequelize.STRING },
      customer_id: { type: Sequelize.INTEGER, allowNull: false }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('emails')
  }
}