cube(`Sales`, {
  sql_table: `public.sales_summary`,

  measures: {
    totalOrders: {
      type: `sum`,
      sql: `${CUBE}.total_orders`
    },

    totalRevenue: {
      type: `sum`,
      sql: `total_revenue`
    },

    totalProfit: {
      type: `sum`,
      sql: `${CUBE}.total_profit`
    },

    totalCost: {
      type: `sum`,
      sql: `${CUBE}.total_cost`
    },

    totalUnitsSold: {
      type: `sum`,
      sql: `${CUBE}.total_units_sold`
    },

    averageMargin: {
      type: `number`,
      sql: `{totalProfit} / NULLIF({totalRevenue}, 0)`,
      format: `percent`
    }
  },

  dimensions: {
    year: {
      sql: `${CUBE}.year`,
      type: `number`
    },

    quarter: {
      sql: `${CUBE}.quarter`,
      type: `string`
    },

    region: {
      sql: `${CUBE}.region`,
      type: `string`
    },

    country: {
      sql: `${CUBE}.country`,
      type: `string`
    },

    product: {
      sql: `${CUBE}.product`,
      type: `string`
    },

    channel: {
      sql: `${CUBE}.channel`,
      type: `string`
    }
  }
});
