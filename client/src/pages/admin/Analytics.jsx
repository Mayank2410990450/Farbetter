import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAnalyticsLogs, getAnalyticsStats } from "@/api/analytics";
import { Loader2, RefreshCw, Smartphone, Monitor } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export default function AdminAnalytics() {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadData = async () => {
        try {
            setLoading(true);
            const [logData, statData] = await Promise.all([
                getAnalyticsLogs(page),
                getAnalyticsStats()
            ]);

            setLogs(logData.logs);
            setTotalPages(logData.pages);
            setStats(statData);
        } catch (err) {
            console.error("Failed to load analytics:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [page]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Visitor Analytics</h1>
                <Button onClick={loadData} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="p-6">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Visits (24h)</h3>
                        <p className="text-3xl font-bold mt-2">{stats.totalVisits24h}</p>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-sm font-medium text-muted-foreground">Unique Visitors (24h)</h3>
                        <p className="text-3xl font-bold mt-2">{stats.uniqueVisitors24h}</p>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-sm font-medium text-muted-foreground">Device Split (24h)</h3>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                                <Smartphone className="w-4 h-4 text-blue-500" />
                                <span className="text-xl font-bold">{stats.deviceSplit.mobile}</span>
                            </div>
                            <div className="h-8 w-px bg-border"></div>
                            <div className="flex items-center gap-1">
                                <Monitor className="w-4 h-4 text-green-500" />
                                <span className="text-xl font-bold">{stats.deviceSplit.desktop}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Logs Table */}
            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Recent Activity Log</h2>

                {loading && logs.length === 0 ? (
                    <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">Loading logs...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Visitor ID</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Page</TableHead>
                                    <TableHead>Device</TableHead>
                                    <TableHead>IP</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.length > 0 ? (
                                    logs.map((log) => (
                                        <TableRow key={log._id}>
                                            <TableCell className="font-mono text-xs">
                                                {format(new Date(log.timestamp), "MMM d, HH:mm:ss")}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {log.visitorId.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell>
                                                {log.user ? (
                                                    log.user.email
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">Guest</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={log.page}>
                                                {log.page}
                                            </TableCell>
                                            <TableCell>
                                                {log.deviceType === 'mobile' ? (
                                                    <Badge variant="outline"><Smartphone className="w-3 h-3 mr-1" /> Mobile</Badge>
                                                ) : (
                                                    <Badge variant="outline"><Monitor className="w-3 h-3 mr-1" /> Desktop</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {log.ip || 'Unknown'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No logs found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                    <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || loading}
                    >
                        Next
                    </Button>
                </div>
            </Card>
        </div>
    );
}
