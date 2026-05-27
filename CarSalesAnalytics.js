cube(`CarSalesAnalytics`, {
  sql: `
    SELECT 
      fs.key_sale,
      fs.sale_date,
      fs.final_price,

      car.brand,
      car.model,
      car.body_type,

      d.year,
      d.month,
      d.month_name,

      l.region,
      l.city

    FROM dw.fact_sales fs
    LEFT JOIN dw.dim_car car 
      ON fs.car_key = car.key_car

    LEFT JOIN dw.dim_client c 
      ON fs.client_key = c.key_client

    LEFT JOIN dw.dim_location l 
      ON c.location_key = l.key_location

    LEFT JOIN dw.dim_date d 
      ON fs.date_key = d.key_date
  `,

  measures: { // Меры
    totalSales: {
      sql: `key_sale`,
      type: `count`,
      title: `Total Sales`
    },

    totalRevenue: {
      sql: `final_price`,
      type: `sum`,
      title: `Total Revenue`
    }
  },

  dimensions: { // Измерения
    saleDate: {
      sql: `sale_date`,
      type: `time`
    },

    year: {
      sql: `year`,
      type: `number`
    },

    monthName: {
      sql: `month_name`,
      type: `string`
    },

    brand: {
      sql: `brand`,
      type: `string`
    },

    model: {
      sql: `model`,
      type: `string`
    },

    bodyType: {
      sql: `body_type`,
      type: `string`
    },

    region: {
      sql: `region`,
      type: `string`
    },

    city: {
      sql: `city`,
      type: `string`
    }
  },

  hierarchies: { // Иерархии
    timeHierarchy: {
      title: `Time Hierarchy`,
      levels: [
        CarSalesAnalytics.year,
        CarSalesAnalytics.monthName
      ]
    },

    geographyHierarchy: {
      title: `Geography Hierarchy`,
      levels: [
        CarSalesAnalytics.region,
        CarSalesAnalytics.city
      ]
    }
  },

  preAggregations: { // преАгрегации
    salesByBrand: {
      type: `rollup`,

      measures: [
        CarSalesAnalytics.totalSales,
        CarSalesAnalytics.totalRevenue
      ],

      dimensions: [
        CarSalesAnalytics.brand
      ],

      refreshKey: {
        every: `1 day`
      }
    },

    salesByRegion: {
      type: `rollup`,

      measures: [
        CarSalesAnalytics.totalSales,
        CarSalesAnalytics.totalRevenue
      ],

      dimensions: [
        CarSalesAnalytics.region
      ],

      refreshKey: {
        every: `6 hours`
      }
    }
  }
});
