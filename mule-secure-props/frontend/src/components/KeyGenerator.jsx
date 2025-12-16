import React, { useState } from 'react';
import {
  Paper,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Grid,
  Checkbox,
  FormControlLabel,
  Slider
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { apiService } from '../services/api';

function KeyGenerator() {
  const [keyType, setKeyType] = useState('password');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true
  });
  const [generatedKey, setGeneratedKey] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    try {
      const requestOptions = keyType === 'password' ? { ...options } : {};
      const response = await apiService.generateKey(keyType, length, requestOptions);
      setGeneratedKey(response.data.key);
      setCopied(false);
    } catch (err) {
      console.error('生成密钥失败:', err);
      alert('生成密钥失败: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCopy = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        密钥生成器
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        生成安全的随机密钥或密码
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>密钥类型</InputLabel>
            <Select
              value={keyType}
              onChange={(e) => setKeyType(e.target.value)}
              label="密钥类型"
            >
              <MenuItem value="password">密码（可读）</MenuItem>
              <MenuItem value="hex">十六进制</MenuItem>
              <MenuItem value="base64">Base64</MenuItem>
              <MenuItem value="uuid">UUID</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {keyType !== 'uuid' && (
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography gutterBottom>
                长度: {length} {keyType === 'password' ? '字符' : '字节'}
              </Typography>
              <Slider
                value={length}
                onChange={(e, val) => setLength(val)}
                min={keyType === 'password' ? 8 : 16}
                max={keyType === 'password' ? 64 : 128}
                step={keyType === 'password' ? 1 : 8}
              />
            </Box>
          </Grid>
        )}

        {keyType === 'password' && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              包含字符类型
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeUppercase}
                    onChange={(e) => setOptions({ ...options, includeUppercase: e.target.checked })}
                  />
                }
                label="大写字母"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeLowercase}
                    onChange={(e) => setOptions({ ...options, includeLowercase: e.target.checked })}
                  />
                }
                label="小写字母"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeNumbers}
                    onChange={(e) => setOptions({ ...options, includeNumbers: e.target.checked })}
                  />
                }
                label="数字"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeSymbols}
                    onChange={(e) => setOptions({ ...options, includeSymbols: e.target.checked })}
                  />
                }
                label="特殊符号"
              />
            </Box>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleGenerate}
            >
              生成密钥
            </Button>
            {generatedKey && (
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopy}
                color={copied ? 'success' : 'primary'}
              >
                {copied ? '已复制' : '复制'}
              </Button>
            )}
          </Box>
        </Grid>

        {generatedKey && (
          <Grid item xs={12}>
            <TextField
              label="生成的密钥"
              fullWidth
              value={generatedKey}
              InputProps={{ readOnly: true }}
              multiline
              rows={keyType === 'uuid' ? 1 : 3}
            />
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}

export default KeyGenerator;

