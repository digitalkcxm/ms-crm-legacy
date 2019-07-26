module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('customers', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING },
      cpf: { type: Sequelize.STRING },
      cpf_status: { type: Sequelize.STRING },
      birthdate: { type: Sequelize.DATE },
      gender: { type: Sequelize.STRING },
      mother_name: { type: Sequelize.STRING },
      deceased: { type: Sequelize.BOOLEAN },
      occupation: { type: Sequelize.STRING },
      income: { type: Sequelize.STRING },
      credit_risk: { type: Sequelize.STRING },
      user_id: { type: Sequelize.INTEGER, allowNull: false },
      company_id: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE },
      updatedAt: { type: Sequelize.DATE },
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('customers')
  }
}