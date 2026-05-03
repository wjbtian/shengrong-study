function unifiedResponse(req, res, next) {
  res.ok = function(data, message) {
    res.json({
      success: true,
      message: message || '操作成功',
      data
    });
  };
  
  res.fail = function(message, code = 400) {
    res.status(code).json({
      success: false,
      message: message || '操作失败'
    });
  };
  
  next();
}

function errorHandler(err, req, res, next) {
  console.error('❌ 服务器错误:', err);
  res.status(500).json({
    success: false,
    message: err.message || '服务器内部错误'
  });
}

module.exports = {
  unifiedResponse,
  errorHandler
};
