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
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { apiService } from '../services/api';

function BatchTool({ versions }) {
  const [javaVersion, setJavaVersion] = useState('1.8');
  const [masterPassword, setMasterPassword] = useState('');
  const [mode, setMode] = useState('encrypt');
  const [inputData, setInputData] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parseInput = () => {
    const lines = inputData.split('\n').filter(line => line.trim());
    const properties = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmed.substring(0, equalIndex).trim();
        let value = trimmed.substring(equalIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        properties.push({ key, value });
      } else if (mode === 'encrypt') {
        // 如果没有等号，尝试解析为 key=value 格式
        properties.push({ key: `key${properties.length + 1}`, value: trimmed });
      }
    }
    
    return properties;
  };

  const handleProcess = async () => {
    if (!inputData || !masterPassword) {
      setError('请输入数据和主密码');
      return;
    }

    const properties = parseInput();
    if (properties.length === 0) {
      setError('未找到有效的属性数据');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      let response;
      if (mode === 'encrypt') {
        response = await apiService.batchEncrypt(properties, masterPassword, javaVersion);
      } else {
        const encryptedProps = properties
          .filter(p => p.value && p.value.startsWith('![AES:'))
          .map(p => ({ key: p.key, encrypted: p.value }));
        
        if (encryptedProps.length === 0) {
          setError('未找到加密的属性');
          setLoading(false);
          return;
        }
        
        response = await apiService.batchDecrypt(encryptedProps, masterPassword, javaVersion);
      }
      
      setResults(response.data.results || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || '处理失败');
    } finally {
      setLoading(false);
    }
  };

  const formatOutput = () => {
    if (results.length === 0) return '';
    
    return results
      .map(r => {
        if (mode === 'encrypt') {
          return `${r.key}=${r.success ? r.encrypted : r.value}`;
        } else {
          return `${r.key}=${r.success ? r.decrypted : r.encrypted}`;
        }
      })
      .join('\n');
  };

  const handleCopyOutput = () => {
    const output = formatOutput();
    navigator.clipboard.writeText(output);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        批量加解密
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        支持properties格式输入，每行一个属性，格式：key=value
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
              <MenuItem value="encrypt">批量加密</MenuItem>
              <MenuItem value="decrypt">批量解密</MenuItem>
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
          <TextField
            label="输入数据（properties格式）"
            multiline
            rows={10}
            fullWidth
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder="key1=value1&#10;key2=value2&#10;key3=![AES:encrypted_value]"
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleProcess}
            disabled={loading}
            size="large"
          >
            {mode === 'encrypt' ? '批量加密' : '批量解密'}
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

        {results.length > 0 && (
          <>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  处理结果 ({results.filter(r => r.success).length}/{results.length} 成功)
                </Typography>
                <Button variant="outlined" onClick={handleCopyOutput}>
                  复制结果
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Key</TableCell>
                      <TableCell>状态</TableCell>
                      <TableCell>{mode === 'encrypt' ? '加密值' : '解密值'}</TableCell>
                      <TableCell>错误信息</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{r.key}</TableCell>
                        <TableCell>
                          <Chip
                            label={r.success ? '成功' : '失败'}
                            color={r.success ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                            {mode === 'encrypt' ? (r.encrypted || r.value) : (r.decrypted || r.encrypted)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {r.error && (
                            <Typography variant="body2" color="error">
                              {r.error}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="输出结果（properties格式）"
                multiline
                rows={10}
                fullWidth
                value={formatOutput()}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Paper>
  );
}

export default BatchTool;

