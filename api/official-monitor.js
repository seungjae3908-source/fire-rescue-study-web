'use strict';
// Vercel detects project-root api/* as Functions. Keep the implementation in v9/api
// so Study logic stays together, and expose it here as the production route.
module.exports=require('../v9/api/official-monitor.js');
