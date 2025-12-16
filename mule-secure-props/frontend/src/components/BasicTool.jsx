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
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { apiService } from '../services/api';

function BasicTool({ versions }) {
  const [javaVersion, setJavaVersion] = useState('1.8');
  const [masterPassword, setMasterPassword] = useState('');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('encrypt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEncrypt = async () => {
    if (!inputText || !masterPassword) {
      setError('请输入明文和主密码');
      return;
    }

    setLoading(true);
    setError(null);
    setOutputText('');

    try {
      const response = await apiService.encrypt(inputText, masterPassword, javaVersion);
      setOutputText(response.data.encryptedValue);
      setMode('encrypt');
    } catch (err) {
      setError(err.response?.data?.message || err.message || '加密失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!inputText || !masterPassword) {
      setError('请输入密文和主密码');
      return;
    }

    setLoading(true);
    setError(null);
    setOutputText('');

    try {
      const response = await apiService.decrypt(inputText, masterPassword, javaVersion);
      setOutputText(response.data.plainText);
      setMode('decrypt');
    } catch (err) {
      setError(err.response?.data?.message || err.message || '解密失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError(null);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        基础加解密
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

        <Grid item xs={12}>
          <TextField
            label="主密码 (Master Password)"
            type="password"
            fullWidth
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label={mode === 'encrypt' ? '明文' : '密文'}
            multiline
            rows={6}
            fullWidth
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={mode === 'encrypt' ? '请输入要加密的明文...' : '请输入要解密的密文（格式：![AES:...]）...'}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<LockIcon />}
              onClick={handleEncrypt}
              disabled={loading}
              size="large"
            >
              加密
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<LockOpenIcon />}
              onClick={handleDecrypt}
              disabled={loading}
              size="large"
            >
              解密
            </Button>
            <Button
              variant="outlined"
              onClick={handleClear}
              disabled={loading}
            >
              清空
            </Button>
          </Box>
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

        {outputText && (
          <Grid item xs={12}>
            <TextField
              label={mode === 'encrypt' ? '密文' : '明文'}
              multiline
              rows={6}
              fullWidth
              value={outputText}
              InputProps={{ readOnly: true }}
              helperText="点击文本框选中所有文本，然后复制（Ctrl+C / Cmd+C）"
            />
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}

export default BasicTool;

