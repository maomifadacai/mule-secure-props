import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Alert
} from '@mui/material';
import BasicTool from './components/BasicTool';
import BatchTool from './components/BatchTool';
import FileTool from './components/FileTool';
import KeyGenerator from './components/KeyGenerator';
import HistoryPanel from './components/HistoryPanel';
import { apiService } from './services/api';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [versions, setVersions] = useState(['1.8', '11', '17']);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 获取支持的Java版本
    apiService.getVersions()
      .then(response => {
        setVersions(response.data.supportedVersions || ['1.8', '11', '17']);
      })
      .catch(err => {
        console.error('Failed to get versions:', err);
        setError('无法连接到后端服务，请确保后端服务正在运行');
      });
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Mule Secure Properties 加解密工具
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          支持 Java 8, 11, 17
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="基础加解密" />
          <Tab label="批量处理" />
          <Tab label="文件处理" />
          <Tab label="密钥生成器" />
          <Tab label="历史记录" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <BasicTool versions={versions} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <BatchTool versions={versions} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <FileTool versions={versions} />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <KeyGenerator />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <HistoryPanel />
      </TabPanel>
    </Container>
  );
}

export default App;

