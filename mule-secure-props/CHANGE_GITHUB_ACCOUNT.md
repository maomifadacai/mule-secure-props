# 将代码推送到另一个 GitHub 账号

## 前提条件

1. 新的 GitHub 账号已经创建
2. 在新账号下创建了仓库（或者我们需要创建）

## 操作步骤

### 步骤 1: 在新 GitHub 账号下创建仓库

如果没有创建，请按以下步骤：

1. 登录新的 GitHub 账号
2. 点击右上角 "+" → "New repository"
3. 填写仓库信息：
   - Repository name: `mule-secure-props`（或你想要的名称）
   - Description: 可选
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

### 步骤 2: 更新远程仓库 URL

使用以下命令更新（替换为你的新账号和仓库信息）：

```bash
# 如果使用 HTTPS
git remote set-url origin https://github.com/NEW_USERNAME/NEW_REPO_NAME.git

# 或如果使用 SSH（推荐）
git remote set-url origin git@github.com:NEW_USERNAME/NEW_REPO_NAME.git
```

### 步骤 3: 验证远程 URL

```bash
git remote -v
```

### 步骤 4: 配置 Git 用户信息（如果需要）

如果新账号使用不同的邮箱，需要更新：

```bash
git config user.name "新用户名"
git config user.email "新邮箱"
```

或者全局配置：
```bash
git config --global user.name "新用户名"
git config --global user.email "新邮箱"
```

### 步骤 5: 推送代码

```bash
# 推送 dev 分支
git push -u origin dev

# 如果需要推送 main 分支
git push -u origin main
```

### 步骤 6: 认证

- **如果使用 HTTPS**：会提示输入新账号的用户名和密码（或 Personal Access Token）
- **如果使用 SSH**：需要确保新账号的 SSH 密钥已添加到 GitHub

## 重要提示

⚠️ **注意**：更改远程仓库后，代码会推送到新账号的仓库，旧账号的仓库不会自动更新。

如果需要保留两个仓库：
- 可以添加多个远程仓库：
  ```bash
  git remote add new-origin https://github.com/NEW_USERNAME/NEW_REPO_NAME.git
  git push -u new-origin dev
  ```

