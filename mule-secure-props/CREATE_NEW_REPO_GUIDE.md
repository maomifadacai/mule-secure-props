# 在新 GitHub 账号下创建仓库并推送代码

## 步骤 1: 在 GitHub 上创建新仓库

1. **登录新的 GitHub 账号**

2. **创建新仓库**：
   - 点击右上角 "+" 号 → 选择 "New repository"
   - 或者直接访问：https://github.com/new

3. **填写仓库信息**：
   - **Repository name**: `mule-secure-props`（建议名称，或使用其他名称）
   - **Description**: 可选，例如："Mule Secure Properties 在线加解密工具"
   - **Visibility**: 
     - ✅ Public（公开，任何人可见）
     - 或 ☑️ Private（私有，只有你可以访问）
   - ⚠️ **重要**：**不要**勾选以下选项：
     - ❌ "Add a README file"
     - ❌ "Add .gitignore"
     - ❌ "Choose a license"
   - 保持仓库为空，因为我们要推送已有的代码

4. **点击 "Create repository" 按钮**

5. **复制仓库 URL**：
   - 创建后会显示仓库页面
   - 复制页面上显示的 HTTPS 或 SSH URL
   - HTTPS 格式：`https://github.com/YOUR_NEW_USERNAME/mule-secure-props.git`
   - SSH 格式：`git@github.com:YOUR_NEW_USERNAME/mule-secure-props.git`

## 步骤 2: 提供信息

创建好仓库后，请告诉我：
- ✅ 新的 GitHub 用户名
- ✅ 仓库名称（如果是 `mule-secure-props` 就不用说了）
- ✅ 你希望使用 HTTPS 还是 SSH（推荐 SSH，更安全方便）

然后我会帮你执行后续的命令！

## 步骤 3: 我将执行的命令（预览）

一旦你提供了信息，我会执行：

```bash
# 更新远程仓库地址
git remote set-url origin https://github.com/YOUR_NEW_USERNAME/REPO_NAME.git

# 或使用 SSH（如果选择 SSH）
git remote set-url origin git@github.com:YOUR_NEW_USERNAME/REPO_NAME.git

# 验证远程地址
git remote -v

# 推送 dev 分支
git push -u origin dev

# 如果需要，也推送 main 分支
git checkout main
git push -u origin main
```

## 注意事项

1. **认证**：
   - 如果使用 HTTPS：推送时会提示输入新账号的用户名和密码（或 Personal Access Token）
   - 如果使用 SSH：确保新账号已添加你的 SSH 公钥到 GitHub

2. **第一次推送**：
   - 如果新仓库是空的，可以直接推送
   - 如果新仓库有文件（比如你创建了 README），需要先拉取并合并

---

**请按照步骤 1 创建仓库，然后告诉我新账号的用户名和仓库名称！** 🚀

