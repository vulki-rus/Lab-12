cube(`CarSalesAnalytics`, {
  sql: `
    SELECT 
      fs.key_sale,
      fs.sale_date,
      fs.final_price,
      fs.base_price,
      fs.client_key,
      fs.demography_key,
      fs.car_key,
      fs.employee_key,
      fs.date_key,
      
      c.first_name || ' ' || c.last_name AS client_full_name,
      c.phone AS client_phone,
      c.email AS client_email,
      
      cd.age AS client_age,
      cd.marital_status,
      cd.children_count,
      
      l.city,
      l.region,
      
      cr.brand,
      cr.model,
      cr.generation,
      cr.body_type,
      cr.color,
      cr.year_manufacture,
      cr.mileage,
      cr.status AS car_status,
      
      e.first_name || ' ' || e.last_name AS employee_name,
      e.position,
      e.salary,
      
      d.year,
      d.month,
      d.month_name,
      d.day,
      d.day_of_week,
      d.day_name
      
    FROM dw.fact_sales fs
    LEFT JOIN dw.dim_client c ON fs.client_key = c.key_client AND c.is_current = true
    LEFT JOIN dw.dim_client_demography cd ON c.demography_key = cd.key_demography
    LEFT JOIN dw.dim_location l ON c.location_key = l.key_location
    LEFT JOIN dw.dim_car cr ON fs.car_key = cr.key_car
    LEFT JOIN dw.dim_employee e ON fs.employee_key = e.key_employee
    LEFT JOIN dw.dim_date d ON fs.date_key = d.key_date
    WHERE c.is_current = true
  `,

  measures: {
    totalSales: {
      sql: `key_sale`,
      type: `count`,
      title: `Total Sales`
    },
    
    totalRevenue: {
      sql: `final_price`,
      type: `sum`,
      title: `Total Revenue`
    },
    
    avgSalePrice: {
      sql: `final_price`,
      type: `avg`,
      title: `Average Sale Price`
    },
    
    avgDiscountPercent: {
      sql: `(base_price - final_price) / base_price * 100`,
      type: `avg`,
      title: `Average Discount %`
    },
    
    totalDiscount: {
      sql: `base_price - final_price`,
      type: `sum`,
      title: `Total Discount`
    },
    
    uniqueClients: {
      sql: `client_key`,
      type: `countDistinct`,
      title: `Unique Clients`
    },
    
    avgMargin: {
      sql: `base_price - final_price`,
      type: `avg`,
      title: `Average Margin`
    }
  },

  dimensions: {
    saleDate: {
      sql: `sale_date`,
      type: `time`,
      title: `Sale Date`
    },
    
    year: {
      sql: `year`,
      type: `number`,
      title: `Year`
    },
    
    month: {
      sql: `month`,
      type: `number`,
      title: `Month`
    },
    
    monthName: {
      sql: `month_name`,
      type: `string`,
      title: `Month`
    },
    
    dayOfWeek: {
      sql: `day_of_week`,
      type: `number`,
      title: `Day of Week`
    },
    
    dayName: {
      sql: `day_name`,
      type: `string`,
      title: `Day`
    },
    
    brand: {
      sql: `brand`,
      type: `string`,
      title: `Brand`
    },
    
    model: {
      sql: `model`,
      type: `string`,
      title: `Model`
    },
    
    bodyType: {
      sql: `body_type`,
      type: `string`,
      title: `Body Type`
    },
    
    color: {
      sql: `color`,
      type: `string`,
      title: `Color`
    },
    
    carGeneration: {
      sql: `generation`,
      type: `string`,
      title: `Generation`
    },
    
    clientFullName: {
      sql: `client_full_name`,
      type: `string`,
      title: `Client`
    },
    
    clientAge: {
      sql: `client_age`,
      type: `number`,
      title: `Age`
    },
    
    ageGroup: {
      type: `string`,
      title: `Age Group`,
      case: {
        when: [
          { sql: `${CUBE.clientAge} < 25`, label: `18-24` },
          { sql: `${CUBE.clientAge} BETWEEN 25 AND 34`, label: `25-34` },
          { sql: `${CUBE.clientAge} BETWEEN 35 AND 44`, label: `35-44` },
          { sql: `${CUBE.clientAge} BETWEEN 45 AND 54`, label: `45-54` }
        ],
        else: { label: `55+` }
      }
    },
    
    maritalStatus: {
      sql: `marital_status`,
      type: `string`,
      title: `Marital Status`
    },
    
    childrenCount: {
      sql: `children_count`,
      type: `number`,
      title: `Children Count`
    },
    
    hasChildren: {
      type: `string`,
      title: `Has Children`,
      case: {
        when: [{ sql: `${CUBE.childrenCount} > 0`, label: `Yes` }],
        else: { label: `No` }
      }
    },
    
    city: {
      sql: `city`,
      type: `string`,
      title: `City`
    },
    
    region: {
      sql: `region`,
      type: `string`,
      title: `Region`
    },
    
    employeeName: {
      sql: `employee_name`,
      type: `string`,
      title: `Manager`
    },
    
    employeePosition: {
      sql: `position`,
      type: `string`,
      title: `Position`
    },
    
    carStatus: {
      sql: `car_status`,
      type: `string`,
      title: `Car Status`
    }
  },

  hierarchies: {
    timeHierarchy: {
      title: `Time Hierarchy`,
      levels: [CarSalesAnalytics.year, CarSalesAnalytics.monthName, CarSalesAnalytics.dayName]
    },
    
    geoClientHierarchy: {
      title: `Geography and Clients`,
      levels: [CarSalesAnalytics.region, CarSalesAnalytics.city, CarSalesAnalytics.ageGroup]
    },
    
    carHierarchy: {
      title: `Car Hierarchy`,
      levels: [CarSalesAnalytics.brand, CarSalesAnalytics.model, CarSalesAnalytics.bodyType]
    },
    
    employeeHierarchy: {
      title: `Employee Hierarchy`,
      levels: [CarSalesAnalytics.employeePosition, CarSalesAnalytics.employeeName]
    }
  },

  preAggregations: {
    salesByBrandAndManager: {
      type: `rollup`,
      measures: [
        CarSalesAnalytics.totalSales,
        CarSalesAnalytics.totalRevenue,
        CarSalesAnalytics.avgSalePrice,
        CarSalesAnalytics.avgDiscountPercent
      ],
      dimensions: [
        CarSalesAnalytics.brand,
        CarSalesAnalytics.employeeName,
        CarSalesAnalytics.year,
        CarSalesAnalytics.month
      ],
      timeDimension: CarSalesAnalytics.saleDate,
      granularity: `day`,
      refreshKey: {
        every: `1 day`
      }
    },
    
    salesByRegionAndAge: {
      type: `rollup`,
      measures: [
        CarSalesAnalytics.totalSales,
        CarSalesAnalytics.totalRevenue,
        CarSalesAnalytics.uniqueClients,
        CarSalesAnalytics.avgMargin
      ],
      dimensions: [
        CarSalesAnalytics.region,
        CarSalesAnalytics.ageGroup,
        CarSalesAnalytics.maritalStatus,
        CarSalesAnalytics.hasChildren
      ],
      refreshKey: {
        every: `6 hours`
      }
    },
    
    monthlySummaryByCarAttributes: {
      type: `rollup`,
      measures: [
        CarSalesAnalytics.totalSales,
        CarSalesAnalytics.totalRevenue,
        CarSalesAnalytics.avgSalePrice
      ],
      dimensions: [
        CarSalesAnalytics.color,
        CarSalesAnalytics.bodyType,
        CarSalesAnalytics.year,
        CarSalesAnalytics.monthName
      ],
      timeDimension: CarSalesAnalytics.saleDate,
      granularity: `month`,
      refreshKey: {
        every: `1 day`
      }
    }
  }
});