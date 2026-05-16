import { RouterList } from "@/router/index";

export type HomePathItem = { path: string; name: string };

/** 与 AsideList.getHomePages 相同的「模块」子菜单数据，供侧栏与顶部导航复用 */
export function getHomePathList(): HomePathItem[] {
  const paths: string[] = [];
  const homeRouter = RouterList.filter((item) => item.name == "home")[0];
  if (!homeRouter?.children) {
    return [];
  }
  homeRouter.children.forEach((route: { path: string }) => {
    const i = route.path.indexOf("HomePage");
    const path = route.path.slice(0, i + 8);
    if (i !== -1 && !paths.includes(path)) {
      paths.push(path);
    }
  });
  return paths.map((item) => {
    const i = item.indexOf("HomePage");
    return {
      path: item,
      name: "homePage." + item.slice(6, i),
    };
  });
}
