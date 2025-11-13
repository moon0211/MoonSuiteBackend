/**
 * 内存数据分页工具函数
 * @param {Array} data - 原始数据数组（必须为数组类型）
 * @param {number|string} page - 当前页码（支持数字或数字字符串，默认1）
 * @param {number|string} pageSize - 每页条数（支持数字或数字字符串，默认10）
 * @param {Object} [options] - 可选配置项
 * @param {number} [options.minPageSize=1] - 最小页大小限制
 * @param {number} [options.maxPageSize=100] - 最大页大小限制（防止一次性请求过多数据）
 * @returns {Object} 分页结果
 * @property {Array} data - 当前页数据
 * @property {Object} pagination - 分页元信息
 * @property {number} totalItems - 总数据条数
 * @property {number} totalPages - 总页数
 * @property {number} currentPage - 当前页码（处理后的有效页码）
 * @property {number} pageSize - 实际使用的页大小（处理后的有效页大小）
 * @property {boolean} hasNextPage - 是否有下一页
 * @property {boolean} hasPrevPage - 是否有上一页
 * @throws {Error} 当输入数据不是数组时抛出错误
 */
function paginate(data, page = 1, pageSize = 10, options = {}) {
  // 1. 基础参数校验
  if (!Array.isArray(data)) {
    throw new Error('分页数据必须是数组类型');
  }

  // 2. 解析并处理页码（确保为有效正整数）
  const currentPage = Math.max(1, parseInt(page, 10) || 1);

  // 3. 解析并处理页大小（结合配置项限制范围）
  const { minPageSize = 1, maxPageSize = 100 } = options;
  let parsedPageSize = parseInt(pageSize, 10) || 10;
  // 限制页大小在 [minPageSize, maxPageSize] 范围内
  const validPageSize = Math.min(
    Math.max(parsedPageSize, minPageSize),
    maxPageSize
  );

  // 4. 计算分页核心数据
  const totalItems = data.length;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / validPageSize) : 0;

  // 5. 处理当前页边界（如果当前页超过总页数，自动修正为最后一页）
  const safeCurrentPage = totalPages === 0
    ? 1  // 无数据时默认显示第1页（数据为空）
    : Math.min(currentPage, totalPages);

  // 6. 计算截取范围并获取当前页数据
  const startIndex = (safeCurrentPage - 1) * validPageSize;
  const endIndex = startIndex + validPageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  // 7. 返回完整分页结果
  return {
    data: paginatedData,
    totalItems,
    totalPages,
    currentPage: safeCurrentPage,
    pageSize: validPageSize,
    hasNextPage: safeCurrentPage < totalPages,
    hasPrevPage: safeCurrentPage > 1
  };
}

// 导出函数（支持CommonJS和ESModule）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { paginate };
}
if (typeof exports !== 'undefined') {
  exports.paginate = paginate;
}
if (typeof window !== 'undefined') {
  window.PaginationUtils = { paginate };
}

export default { paginate };