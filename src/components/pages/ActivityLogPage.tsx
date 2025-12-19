import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BaseCrudService } from '@/integrations';
import { ActivityLogs } from '@/entities';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Search, Activity, User, Calendar } from 'lucide-react';

interface ActivityLogPageProps {
  role: 'admin' | 'store';
}

export default function ActivityLogPage({ role }: ActivityLogPageProps) {
  const [logs, setLogs] = useState<ActivityLogs[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLogs[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      const logsData = await BaseCrudService.getAll<ActivityLogs>('activitylogs');
      setLogs(logsData.items);
      setFilteredLogs(logsData.items);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...logs];

    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(log => log.userRole === roleFilter);
    }

    setFilteredLogs(filtered);
  }, [searchQuery, actionFilter, roleFilter, logs]);

  const uniqueActions = Array.from(new Set(logs.map(log => log.action).filter(Boolean)));
  const uniqueRoles = Array.from(new Set(logs.map(log => log.userRole).filter(Boolean)));

  const getActionColor = (action?: string) => {
    if (!action) return 'bg-gray-100 text-gray-800';
    
    if (action.toLowerCase().includes('create') || action.toLowerCase().includes('add')) {
      return 'bg-green-100 text-green-800';
    }
    if (action.toLowerCase().includes('update') || action.toLowerCase().includes('edit')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (action.toLowerCase().includes('delete') || action.toLowerCase().includes('remove')) {
      return 'bg-red-100 text-red-800';
    }
    if (action.toLowerCase().includes('login') || action.toLowerCase().includes('logout')) {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <DashboardLayout role={role}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="font-paragraph text-secondary">Loading activity logs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role}>
      <div className="p-8 max-w-[100rem] mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-5xl text-foreground mb-2">Activity Logs</h1>
          <p className="font-paragraph text-lg text-secondary">
            Track user actions and system events
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-white rounded-xl shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
              <Input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-paragraph"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="font-paragraph">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action || ''}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="font-paragraph">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {uniqueRoles.map((role) => (
                  <SelectItem key={role} value={role || ''}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-background rounded-xl">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Total Activities</h3>
              <p className="font-heading text-4xl text-foreground">{filteredLogs.length}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-background rounded-xl">
                  <User className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Unique Users</h3>
              <p className="font-heading text-4xl text-foreground">
                {new Set(filteredLogs.map(log => log.userId).filter(Boolean)).size}
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-background rounded-xl">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-paragraph text-sm text-secondary mb-2">Today's Activities</h3>
              <p className="font-heading text-4xl text-foreground">
                {filteredLogs.filter(log => {
                  const logDate = new Date(log.timestamp || '');
                  const today = new Date();
                  return logDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-heading text-2xl text-foreground mb-6">Activity Timeline</h3>
            <div className="space-y-4">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <motion.div
                    key={log._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="flex items-start space-x-4 p-4 bg-background rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="p-2 bg-white rounded-lg">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge className={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                          {log.userRole && (
                            <Badge className="ml-2 bg-gray-100 text-gray-800">
                              {log.userRole}
                            </Badge>
                          )}
                        </div>
                        <span className="font-paragraph text-xs text-secondary">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <p className="font-paragraph text-sm text-foreground mb-1">
                        {log.details || 'No details available'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-secondary font-paragraph">
                        {log.userId && (
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>User: {log.userId}</span>
                          </span>
                        )}
                        {log.entityType && (
                          <span>Entity: {log.entityType}</span>
                        )}
                        {log.entityId && (
                          <span>ID: {log.entityId.substring(0, 8)}...</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-secondary mx-auto mb-4" />
                  <h3 className="font-heading text-2xl text-foreground mb-2">No activity logs found</h3>
                  <p className="font-paragraph text-secondary">
                    {searchQuery || actionFilter !== 'all' || roleFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Activity logs will appear here as actions are performed'}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
