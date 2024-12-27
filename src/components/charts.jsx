"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

const API_URL = "http://localhost:2005/api";
const ALBUMS_PER_PAGE = 10;

export default function MinimizableAlbumPerformanceChart() {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedAlbums, setSelectedAlbums] = useState([null, null]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/album-performance`);
        const indexedData = response.data.map((item, index) => ({
          ...item,
          index: index + 1,
        }));
        setChartData(indexedData);
      } catch (error) {
        console.error("Error fetching album performance data:", error);
        setError(
          "Failed to fetch album performance data. Please try again later.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(chartData.length / ALBUMS_PER_PAGE);

  const paginatedData = compareMode
    ? chartData.filter((album) => selectedAlbums.includes(album.index))
    : chartData.slice(
        (currentPage - 1) * ALBUMS_PER_PAGE,
        currentPage * ALBUMS_PER_PAGE,
      );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-4 rounded-md shadow-md border border-border">
          <p className="font-bold mb-2">{data.album}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {new Intl.NumberFormat("en").format(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => (
    <ResponsiveContainer width="100%" height={isMobile ? "100%" : 400}>
      <ChartContainer
        config={{
          plays: {
            label: "Plays",
            color: "hsl(var(--chart-1))",
          },
          likes: {
            label: "Likes",
            color: "hsl(var(--chart-2))",
          },
          shares: {
            label: "Shares",
            color: "hsl(var(--chart-3))",
          },
        }}
      >
        <LineChart
          data={paginatedData}
          margin={{
            top: 20,
            right: isMobile ? 5 : 10,
            left: isMobile ? 15 : 10,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={compareMode ? "album" : "index"}
            tick={{ fontSize: isMobile ? 10 : 12 }}
            label={{
              value: compareMode ? "Album Title" : "Album Number",
              position: "bottom",
              offset: 0,
            }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: isMobile ? 10 : 12 }}
            tickFormatter={(value) => `${value / 1000}k`}
            width={isMobile ? 30 : 40}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: isMobile ? 10 : 12 }}
            tickFormatter={(value) => `${value / 1000}k`}
            width={isMobile ? 30 : 40}
          />
          <ChartTooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="plays"
            stroke="var(--color-plays)"
            strokeWidth={2}
            dot={true}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="likes"
            stroke="var(--color-likes)"
            strokeWidth={2}
            dot={true}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="shares"
            stroke="var(--color-shares)"
            strokeWidth={2}
            dot={true}
          />
        </LineChart>
      </ChartContainer>
    </ResponsiveContainer>
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleCompareToggle = () => {
    setCompareMode(!compareMode);
    if (!compareMode) {
      setSelectedAlbums([null, null]);
    }
  };

  const handleAlbumSelect = (index, albumNumber) => {
    setSelectedAlbums((prev) => {
      const newSelection = [...prev];
      newSelection[index] = Number(albumNumber);
      return newSelection;
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-[400px]">
          <p>Loading chart data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="py-7">
            <CardTitle>Album Performance Trends</CardTitle>
            <CardDescription>
              Trends of plays, likes, and shares across albums
            </CardDescription>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="p-0 sm:p-6">
            <div className="flex justify-between items-center mb-4 px-4">
              <div className="flex space-x-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || compareMode}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || compareMode}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  Next
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleCompareToggle}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  {compareMode ? "Exit Compare Mode" : "Compare Albums"}
                </Button>
                {compareMode && (
                  <>
                    <Select
                      onValueChange={(value) => handleAlbumSelect(0, value)}
                      value={selectedAlbums[0]?.toString()}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Album 1" />
                      </SelectTrigger>
                      <SelectContent>
                        {chartData.map((album) => (
                          <SelectItem
                            key={album.index}
                            value={album.index.toString()}
                          >
                            {album.album}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={(value) => handleAlbumSelect(1, value)}
                      value={selectedAlbums[1]?.toString()}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Album 2" />
                      </SelectTrigger>
                      <SelectContent>
                        {chartData.map((album) => (
                          <SelectItem
                            key={album.index}
                            value={album.index.toString()}
                          >
                            {album.album}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
            </div>
            <div className={`w-full ${isMobile ? "h-[400px]" : "h-[400px]"}`}>
              {renderChart()}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
