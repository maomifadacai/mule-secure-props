# Git 认证配置指南

## 方案一：使用 SSH（推荐）

### 步骤 1: 将远程 URL 改为 SSH

```bash
git remote set-url origin git@github.com:maomidafacai/mule-secure-props.git
```

### 步骤 2: 验证远程 URL

```bash
git remote -v
```

应该显示：
```
origin  git@github.com:maomidafacai/mule-secure-props.git (fetch)
origin  git@github.com:maomidafacai/mule-secure-props.git (push)
```

### 步骤 3: 测试 SSH 连接

```bash
ssh -T git@github.com
```

如果看到 "Hi maomidafacai! You've successfully authenticated..." 说明配置成功。

### 步骤 4: 如果 SSH 未配置，需要添加 SSH 密钥到 GitHub

1. **复制 SSH 公钥**：
   ```bash
   cat ~/.ssh/id_rsa.pub
   ```
   （Windows PowerShell: `Get-Content $env:USERPROFILE\.ssh\id_rsa.pub`）

2. **添加到 GitHub**：
   - 登录 GitHub
   - 点击右上角头像 → Settings
   - 左侧菜单选择 "SSH and GPG keys"
   - 点击 "New SSH key"
   - Title: 输入一个描述（如 "My Windows PC"）
   - Key: 粘贴刚才复制的公钥内容
   - 点击 "Add SSH key"

### 步骤 5: 推送分支

```bash
git push -u origin dev
```

---

## 方案二：使用 HTTPS + 个人访问令牌（Personal Access Token）

### 步骤 1: 生成 GitHub 个人访问令牌

1. 登录 GitHub
2. 点击右上角头像 → Settings
3. 左侧菜单选择 "Developer settings"
4. 选择 "Personal access tokens" → "Tokens (classic)"
5. 点击 "Generate new token" → "Generate new token (classic)"
6. 设置：
   - Note: 输入描述（如 "Git Push Token"）
   - Expiration: 选择过期时间（建议 90 days 或 No expiration）
   - 勾选权限：至少勾选 `repo` 权限
7. 点击 "Generate token"
8. **重要**：复制生成的令牌（只显示一次，务必保存）

### 步骤 2: 配置 Git 凭据管理器（Windows）

```bash
# 使用 Git Credential Manager
git config --global credential.helper manager-core
```

### 步骤 3: 推送分支（首次会提示输入凭据）

```bash
git push -u origin dev
```

当提示输入用户名和密码时：
- **Username**: 你的 GitHub 用户名（maomidafacai）
- **Password**: 输入刚才生成的个人访问令牌（不是GitHub密码）

### 步骤 4: 后续推送

配置后，凭据会被保存，后续推送无需再次输入。

---

## 推荐方案

**建议使用方案一（SSH）**，因为：
- ✅ 无需每次输入密码
- ✅ 更安全
- ✅ 一次配置，长期使用
- ✅ 你已经有了 SSH 密钥

如果 SSH 密钥尚未添加到 GitHub，按方案一步骤 4 操作即可。

