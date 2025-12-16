# GitHub 个人访问令牌（Personal Access Token）获取指南

## 步骤 1: 登录 GitHub

登录你的 GitHub 账号（dengxn@gmail.com）

## 步骤 2: 进入设置页面

1. 点击右上角的**头像图标**
2. 在下拉菜单中选择 **"Settings"**（设置）

## 步骤 3: 进入开发者设置

1. 在左侧边栏最底部，找到并点击 **"Developer settings"**（开发者设置）

## 步骤 4: 创建个人访问令牌

### 4.1 选择令牌类型

1. 在左侧菜单中，点击 **"Personal access tokens"**（个人访问令牌）
2. 然后点击 **"Tokens (classic)"**（经典令牌）
   - 注意：GitHub 也提供 "Fine-grained tokens"，但经典令牌更简单通用

### 4.2 生成新令牌

1. 点击 **"Generate new token"**（生成新令牌）
2. 选择 **"Generate new token (classic)"**（生成经典令牌）

### 4.3 配置令牌

填写以下信息：

**Note（备注）**：
- 输入一个描述性名称，例如：`mule-secure-props-push`
- 这样以后你可以识别这个令牌的用途

**Expiration（过期时间）**：
- 选择过期时间：
  - `90 days`（90天）
  - `No expiration`（永不过期）- **推荐**，方便使用
  - 或自定义日期

**Select scopes（选择权限）**：
至少勾选以下权限：
- ✅ **`repo`** - 完整仓库访问权限
  - 这会自动勾选所有子权限：
    - `repo:status`
    - `repo_deployment`
    - `public_repo`
    - `repo:invite`
    - `security_events`
    - `workflow`

如果只需要推送代码，勾选 `repo` 就足够了。

### 4.4 生成并复制令牌

1. 滚动到页面底部，点击 **"Generate token"**（生成令牌）按钮
2. **⚠️ 重要**：令牌**只会显示一次**，请立即复制保存！
3. 令牌格式类似：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 步骤 5: 保存令牌

**非常重要**：
- 将令牌复制到安全的地方（密码管理器、文本文件等）
- 如果丢失，需要重新生成
- 不要将令牌分享给他人或提交到代码仓库

## 步骤 6: 使用令牌推送代码

在命令行执行推送时：

```bash
git push -u origin dev
```

当提示输入：
- **Username（用户名）**：输入你的 GitHub 用户名（例如：`dengxn`）
- **Password（密码）**：**不要输入 GitHub 密码**，而是粘贴刚才生成的 Personal Access Token

## 注意事项

1. **令牌即密码**：Personal Access Token 相当于密码，请妥善保管
2. **权限最小化**：只勾选需要的权限
3. **定期检查**：可以在 Settings → Developer settings → Personal access tokens 中查看和管理令牌
4. **撤销令牌**：如果令牌泄露，可以在这里删除它
5. **Git Credential Manager**：Windows 可能会保存你的凭据，以后推送就不需要再次输入

## 如果忘记了令牌

如果忘记或丢失令牌，你需要：
1. 删除旧的令牌（在 GitHub 设置中）
2. 按照上述步骤重新生成一个新令牌

---

**现在你可以按照步骤生成令牌，然后在推送时使用它！** 🔑

