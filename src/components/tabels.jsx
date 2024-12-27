import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  Music,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";

const API_URL = "http://localhost:2005/api";

const COLUMNS = [
  { key: "covers", label: "Covers", sortable: false },
  { key: "title", label: "Title", sortable: true },
  { key: "release_date", label: "Release Date", sortable: true },
  { key: "track_count", label: "Tracks", sortable: true },
];

export default function DiscographyTable() {
  const [discography, setDiscography] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState(
    COLUMNS.map((col) => col.key),
  );
  const [albumFilter, setAlbumFilter] = useState("all");
  const [isMobileView, setIsMobileView] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isViewSettingsOpen, setIsViewSettingsOpen] = useState(false);

  useEffect(() => {
    const fetchDiscography = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/album-performance`);
        const processedData = response.data.map((album) => ({
          ...album,
          covers: album.cover
            ? album.cover.split(",").map((url) => url.trim())
            : ["/placeholder.svg?height=300&width=300"],
          release_date: album.release_date
            ? new Date(album.release_date).toISOString().split("T")[0]
            : "Unknown",
          tracks: album.tracks ? album.tracks : "No tracks available",
        }));
        setDiscography(processedData);
      } catch (error) {
        console.error("Error fetching discography:", error);
        setError("Failed to fetch discography. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscography();

    const handleResize = () => {
      const newIsMobileView = window.innerWidth < 768;
      setIsMobileView(newIsMobileView);
      if (newIsMobileView) {
        setVisibleColumns(["covers", "title"]);
      } else {
        setVisibleColumns(COLUMNS.map((col) => col.key));
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredAndSortedDiscography = React.useMemo(() => {
    let result = discography.filter((item) =>
      Object.values(item).some(
        (value) =>
          value &&
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );

    if (albumFilter !== "all") {
      result = result.filter((item) => item.title === albumFilter);
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [discography, searchTerm, sortConfig, albumFilter]);

  const paginatedDiscography = filteredAndSortedDiscography.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(
    filteredAndSortedDiscography.length / itemsPerPage,
  );

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey],
    );
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = isMobileView ? 3 : 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pageNumbers.map((number) => (
          <Button
            key={number}
            variant={currentPage === number ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(number)}
            className={
              isMobileView && number !== currentPage
                ? "hidden sm:inline-flex"
                : ""
            }
          >
            {number}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderCovers = (covers) => (
    <Carousel className="w-full max-w-xs mx-auto">
      <CarouselContent className="flex">
        {covers.map((cover, index) => (
          <CarouselItem
            key={index}
            className="flex items-center justify-center w-full h-full"
          >
            <div className="relative w-full pt-[100%] flex items-center justify-center">
              <img
                src={cover}
                alt={`Cover ${index + 1}`}
                className="absolute top-0 left-0 w-full h-full object-cover rounded"
                style={{ transform: "none" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder.svg?height=300&width=300";
                }}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );

  const renderMobileCard = (item) => (
    <Card key={item.id} className="mb-4" onClick={() => setSelectedAlbum(item)}>
      <CardHeader className="flex flex-col items-center pb-2">
        <div className="flex flex-wrap justify-center gap-2 mb-2 w-full">
          {renderCovers(item.covers)}
        </div>
        <CardTitle className="text-lg text-center">{item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {visibleColumns.includes("release_date") && (
          <p className="text-sm">
            <strong>Release Date:</strong> {item.release_date}
          </p>
        )}
        {visibleColumns.includes("track_count") && (
          <p className="text-sm">
            <strong>Tracks:</strong> {item.track_count}
          </p>
        )}{" "}
        {visibleColumns.includes("type") && (
          <p className="text-sm">
            <strong>type:</strong> {item.type}
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderAlbumDetails = () => {
    if (!selectedAlbum) return null;

    return (
      <Dialog
        open={!!selectedAlbum}
        onOpenChange={() => setSelectedAlbum(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-2xl">
              {selectedAlbum.title}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {renderCovers(selectedAlbum.covers)}
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="text-sm font-medium">id:</span>
              <span className="text-sm">{selectedAlbum.id}</span>
              <span className="text-sm font-medium">Release Date:</span>
              <span className="text-sm">{selectedAlbum.release_date}</span>
              <span className="text-sm font-medium">Tracks:</span>
              <span className="text-sm">{selectedAlbum.track_count}</span>
              <span className="text-sm font-medium">type:</span>
              <span className="text-sm">{selectedAlbum.type}</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <span className="text-sm font-medium">Track List:</span>
              </div>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <pre className="text-sm whitespace-pre-wrap">
                  {selectedAlbum.tracks}
                </pre>
              </ScrollArea>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Additional Files:</span>
              <Button variant="outline" size="sm">
                Download Lyrics
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-center p-6 text-red-500">{error}</div>;

  return (
    <div className="p-4 md:p-6 bg-background text-foreground">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Select value={albumFilter} onValueChange={setAlbumFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by Album" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Albums</SelectItem>
              {discography.map((album) => (
                <SelectItem key={album.id} value={album.title}>
                  {album.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isViewSettingsOpen} onOpenChange={setIsViewSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full md:w-auto">
              <Settings className="h-4 w-4 mr-2" />
              View Settings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Table View Settings</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <h4 className="mb-2 font-medium">Visible Columns</h4>
              {COLUMNS.map((column) => (
                <div
                  key={column.key}
                  className="flex items-center space-x-2 mb-2"
                >
                  <Checkbox
                    id={column.key}
                    checked={visibleColumns.includes(column.key)}
                    onCheckedChange={() => toggleColumnVisibility(column.key)}
                  />
                  <label htmlFor={column.key}>{column.label}</label>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {isMobileView ? (
        <div>{paginatedDiscography.map(renderMobileCard)}</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {COLUMNS.filter((col) => visibleColumns.includes(col.key)).map(
                  (column) => (
                    <TableHead key={column.key}>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          column.sortable && requestSort(column.key)
                        }
                        className={column.sortable ? "cursor-pointer" : ""}
                      >
                        {column.label}
                        {sortConfig.key === column.key &&
                          (sortConfig.direction === "ascending" ? " ↑" : " ↓")}
                      </Button>
                    </TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDiscography.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => setSelectedAlbum(item)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  {COLUMNS.filter((col) =>
                    visibleColumns.includes(col.key),
                  ).map((column) => (
                    <TableCell key={column.key}>
                      {column.key === "covers" ? (
                        <div className="flex flex-wrap gap-2">
                          <img
                            src={item.covers[0]}
                            alt={`Cover for ${item.title}`}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "/placeholder.svg?height=64&width=64";
                            }}
                          />
                        </div>
                      ) : (
                        item[column.key]
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-4 md:space-y-0">
        <div className="text-sm text-muted-foreground">
          {paginatedDiscography.length} of {filteredAndSortedDiscography.length}{" "}
          row(s) displayed
        </div>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Rows per page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {renderPagination()}
        </div>
      </div>
      {renderAlbumDetails()}
    </div>
  );
}
