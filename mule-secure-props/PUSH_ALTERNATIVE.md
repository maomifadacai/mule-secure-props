# 推送代码的替代方法

如果遇到身份验证问题，可以使用以下方法：

## 方法 1: 在 URL 中嵌入 Token（最简单）

如果你已经有了 Personal Access Token，可以在推送时直接使用：

```powershell
# 将 YOUR_TOKEN 替换为你的实际 token
git push https://YOUR_TOKEN@github.com/dengxn/mule-secure-props.git dev
```

或者临时更改远程 URL：

```powershell
# 1. 临时更改远程 URL，嵌入 token
git remote set-url origin https://YOUR_TOKEN@github.com/dengxn/mule-secure-props.git

# 2. 推送
git push -u origin dev

# 3. 推送成功后，改回普通 URL（安全考虑）
git remote set-url origin https://github.com/dengxn/mule-secure-props.git
```

## 方法 2: 使用 SSH（推荐）

如果改用 SSH，不需要每次输入密码：

```powershell
# 1. 改为 SSH URL
git remote set-url origin git@github.com:dengxn/mule-secure-props.git

# 2. 确保新 GitHub 账号已添加你的 SSH 公钥
#    查看公钥：Get-Content $env:USERPROFILE\.ssh\id_rsa.pub
#    然后在 GitHub: Settings → SSH and GPG keys → New SSH key

# 3. 推送（不需要输入密码）
git push -u origin dev
```

## 方法 3: 使用 Git Credential Manager Store（Windows）

```powershell
git config --global credential.helper store
git push -u origin dev
# 第一次会提示输入，之后会被保存
```

## 获取 Token

如果还没有 Token，访问：https://github.com/settings/tokens/new

1. Note: `mule-secure-props`
2. 勾选 `repo` 权限
3. Generate token
4. 复制 token（以 `ghp_` 开头）

