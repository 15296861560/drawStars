/** 与侧栏「未定义错误模拟」一致：触发对未声明标识符的引用 */
export function mockUndefinedRouteError(): void {
  new Function("abcd = efgh")();
}
