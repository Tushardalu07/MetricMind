cube(`Sales`, {
  sql_table: `public.sales_summary`,

  measures: {
    totalRevenue: {
      type: `sum`,
      sql: `total_revenue`
    },

    totalProfit: {
      type: `sum`,
      sql: `total_profit`
    },

    totalUnitsSold: {
      type: `sum`,
      sql: `total_units_sold`
    },

    averageMargin: {
      type: `avg`,
      sql: `avg_margin_percent`
    }
  },

  dimensions: {
    year: {
      sql: `year`,
      type: `number`
    },

    quarter: {
      sql: `quarter`,
      type: `string`
    },

    region: {
      sql: `region`,
      type: `string`
    },

    country: {
      sql: `country`,
      type: `string`
    },

    product: {
      sql: `product`,
      type: `string`
    },

    channel: {
      sql: `channel`,
      type: `string`
    }
  }
});