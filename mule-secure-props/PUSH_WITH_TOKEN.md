# 使用 Token 推送代码的方法

## 方法 1: 在命令中临时使用 Token（推荐）

如果你已经有了 Personal Access Token，可以在推送命令中临时使用：

```bash
# 将 YOUR_TOKEN 替换为你的实际 token
git push https://YOUR_TOKEN@github.com/dengxn/mule-secure-props.git dev
```

或者使用环境变量：

```bash
# Windows PowerShell
$env:GIT_ASKPASS=""
git -c credential.helper='!f() { echo "username=dengxn"; echo "password=YOUR_TOKEN"; }; f' push -u origin dev
```

## 方法 2: 配置 Git Credential Manager

```bash
# 配置凭据管理器
git config --global credential.helper manager-core

# 然后执行推送（会提示输入，输入一次后会被记住）
git push -u origin dev
```

## 方法 3: 使用 SSH（推荐，最方便）

如果改用 SSH，一次配置后就不需要每次输入密码：

```bash
# 1. 将远程 URL 改为 SSH
git remote set-url origin git@github.com:dengxn/mule-secure-props.git

# 2. 确保新 GitHub 账号已添加你的 SSH 公钥
# 3. 推送（不需要输入密码）
git push -u origin dev
```

## 方法 4: 手动在 URL 中嵌入 token（临时）

```bash
# 临时更改远程 URL，嵌入 token
git remote set-url origin https://YOUR_TOKEN@github.com/dengxn/mule-secure-props.git

# 推送
git push -u origin dev

# 推送成功后，改回普通 URL（避免 token 泄露）
git remote set-url origin https://github.com/dengxn/mule-secure-props.git
```

## 获取 Token 的快速链接

直接访问：https://github.com/settings/tokens/new

步骤：
1. Note: 输入 `mule-secure-props`
2. Expiration: 选择 `No expiration` 或 `90 days`
3. 勾选 `repo` 权限
4. 点击 Generate token
5. 复制 token（以 `ghp_` 开头）

