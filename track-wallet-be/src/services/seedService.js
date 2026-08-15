const Account = require('../models/Account');
const Category = require('../models/Category');
const { DEFAULT_ACCOUNTS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } = require('../seed/defaultCategories');

async function seedUserDefaults(userId) {
  await Account.insertMany(
    DEFAULT_ACCOUNTS.map((a) => ({ ...a, userId, balance: 0 }))
  );

  async function insertTree(items, type) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const parent = await Category.create({
        userId,
        name: item.name,
        type,
        icon: item.icon,
        color: item.color,
        parentId: null,
        sortOrder: i,
      });
      if (item.subcategories?.length) {
        await Category.insertMany(
          item.subcategories.map((sub, j) => ({
            userId,
            name: sub.name,
            type,
            icon: sub.icon,
            color: sub.color,
            parentId: parent._id,
            sortOrder: j,
          }))
        );
      }
    }
  }

  await insertTree(EXPENSE_CATEGORIES, 'expense');
  await insertTree(INCOME_CATEGORIES, 'income');
}

module.exports = { seedUserDefaults };
