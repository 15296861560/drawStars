# 积分管理体系说明

前端积分模块代码位于：

- `src/types/points.ts`
- `src/api/points.ts`
- `src/stores/points.ts`
- `src/composables/usePoints.ts`
- `src/components/points/*`

后端（Nest + Prisma + MySQL）位于仓库：

`D:\Data\Web\Demo\drawStars-serve-node`

相关文件：

- SQL：`sql/points_tables.sql`
- Prisma：`prisma/schema.prisma`（Points* models）
- 接口：`src/nest/modules/points/`

建表：

```bash
cd D:\Data\Web\Demo\drawStars-serve-node
pnpm prisma:points-tables
# 或
pnpm db:sync
pnpm prisma generate
```

前端切真实接口：`.env` 设置 `VITE_POINTS_MOCK=false`

管理员给用户新增积分：

- 接口：`POST /api/points/admin/grant`（需权限 `system:points:operate`）
- 前端 `$axios`/`$axiosGet` 路径写 `/points/...`（基址已含 `/api`）
- 必填：`userId`、`points`（正数）、`reason`（原因）
- 操作人：取当前登录用户，写入流水 `extra_data.operatorId/operatorName`
- 管理页：积分管理 →「新增积分」
