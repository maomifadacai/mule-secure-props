import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { apiService } from '../services/api';

function HistoryPanel() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enabled, setEnabled] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getHistory();
      setHistory(response.data.history || []);
      setEnabled(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setEnabled(false);
      } else {
        setError(err.response?.data?.message || err.message || '获取历史记录失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('确定要清除所有历史记录吗？')) return;

    try {
      await apiService.clearHistory();
      setHistory([]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || '清除历史记录失败');
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  if (!enabled) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          历史记录功能未启用。请在后端配置中设置 ENABLE_HISTORY=true 来启用此功能。
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          操作历史记录
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleClear}
          disabled={history.length === 0}
        >
          清除历史
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {!loading && history.length === 0 && (
        <Alert severity="info">暂无历史记录</Alert>
      )}

      {!loading && history.length > 0 && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>时间</TableCell>
                <TableCell>操作</TableCell>
                <TableCell>Java版本</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>Key</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {new Date(entry.timestamp).toLocaleString('zh-CN')}
                  </TableCell>
                  <TableCell>
                    {entry.operation === 'encrypt' ? '加密' : '解密'}
                  </TableCell>
                  <TableCell>Java {entry.javaVersion}</TableCell>
                  <TableCell>
                    <Chip
                      label={entry.success ? '成功' : '失败'}
                      color={entry.success ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{entry.key || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

export default HistoryPanel;

