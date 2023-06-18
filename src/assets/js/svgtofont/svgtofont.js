/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2023-06-18 00:58:03
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-18 03:24:37
 */
const svgtofont = require("svgtofont");
const path = require("path");

svgtofont({
    src: path.resolve(__dirname, "../../img/svg"),
    dist: path.resolve(__dirname, "../../styles/font"),
    fontName: "drawstars-icon",
    css: {
        fontSize: "32px",
        // 样式文件输出路径(相对于执行命令路径)
        output: "./src/assets/styles/fontStyle",
        // 输出的样式文件类型
        include: "css" | "less",
        // 样式文件的文件名
        fileName: "drawstars-font",
        // 字体文件相对于样式文件的路径
        cssPath: "../font/",
    },
    svgicons2svgfont: {
        // 通过将图标缩放到最高图标的高度来规范化图标。
        normalize: true,
    },
})