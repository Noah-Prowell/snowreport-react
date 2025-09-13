module.exports = async function (context, req) {
  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: { 
      status: 'Server is running!', 
      timestamp: new Date().toISOString() 
    }
  };
};