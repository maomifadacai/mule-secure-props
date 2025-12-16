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
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { apiService } from '../services/api';

function FileTool({ versions }) {
  const [javaVersion, setJavaVersion] = useState('1.8');
  const [masterPassword, setMasterPassword] = useState('');
  const [mode, setMode] = useState('encrypt');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleProcess = async () => {
    if (!file || !masterPassword) {
      setError('请选择文件并输入主密码');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;
      if (mode === 'encrypt') {
        response = await apiService.encryptFile(file, masterPassword, javaVersion);
      } else {
        response = await apiService.decryptFile(file, masterPassword, javaVersion);
      }
      
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || '处理失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result || !result.results) return;

    const blob = new Blob([result.results], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/\.(properties|txt|prop)$/, '')}_${mode === 'encrypt' ? 'encrypted' : 'decrypted'}.properties`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        文件批量处理
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        上传properties文件进行批量加解密处理
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Java版本</InputLabel>
            <Select
              value={javaVersion}
              onChange={(e) => setJavaVersion(e.target.value)}
              label="Java版本"
            >
              {versions.map(v => (
                <MenuItem key={v} value={v}>Java {v}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>操作模式</InputLabel>
            <Select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              label="操作模式"
            >
              <MenuItem value="encrypt">文件加密</MenuItem>
              <MenuItem value="decrypt">文件解密</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="主密码"
            type="password"
            fullWidth
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
            >
              选择文件
              <input
                type="file"
                hidden
                accept=".properties,.txt,.prop"
                onChange={handleFileChange}
              />
            </Button>
            {file && (
              <Typography variant="body2">
                已选择: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleProcess}
            disabled={loading || !file}
            size="large"
          >
            {mode === 'encrypt' ? '加密文件' : '解密文件'}
          </Button>
        </Grid>

        {loading && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          </Grid>
        )}

        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        {result && (
          <>
            <Grid item xs={12}>
              <Alert severity="success">
                处理完成！成功: {result.encryptedCount || result.decryptedCount || 0} / 
                总计: {result.originalCount || 0}
                {result.failedCount > 0 && `，失败: ${result.failedCount}`}
              </Alert>
            </Grid>

            {result.errors && result.errors.length > 0 && (
              <Grid item xs={12}>
                <Alert severity="warning">
                  部分处理失败：
                  <ul>
                    {result.errors.map((err, idx) => (
                      <li key={idx}>{err.key}: {err.error}</li>
                    ))}
                  </ul>
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                label="处理结果"
                multiline
                rows={15}
                fullWidth
                value={result.results || ''}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownload}
              >
                下载结果文件
              </Button>
            </Grid>
          </>
        )}
      </Grid>
    </Paper>
  );
}

export default FileTool;

