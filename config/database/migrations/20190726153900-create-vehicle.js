module.exports = {
  up: (queryInteface, Sequelize) => {
    return queryInteface.createTable('vehicles', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      plate: { type: Sequelize.STRING },
      model: { type: Sequelize.STRING },
      year: { type: Sequelize.STRING },
      renavam: { type: Sequelize.STRING },
      chassi: { type: Sequelize.STRING },
      license: { type: Sequelize.STRING },
      customer_id: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE },
      updatedAt: { type: Sequelize.DATE }
    })
  },
  down: (queryInteface, Sequelize) => {
    return queryInteface.dropTable('vehicles')
  }
}