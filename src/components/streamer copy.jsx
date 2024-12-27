import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Music,
  Video,
  Home,
  Sun,
  Moon,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import AlbumPerformanceChart from "./charts";
import TabelDiscography from "./tabels";
import Member from "./character";

const API_URL = "http://localhost:2005/api";

export default function Component() {
  const [mediaList, setMediaList] = useState([]);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [showVideoControls, setShowVideoControls] = useState(false);
  const mediaRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    fetchMediaList();
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (mediaList.length > 0 && !currentMedia && activeTab) {
      setCurrentMedia(mediaList.find((item) => item.type === activeTab));
    }
  }, [mediaList, currentMedia, activeTab]);

  const fetchMediaList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}`);
      setMediaList(response.data);
    } catch (error) {
      console.error("Error fetching media list:", error);
      setError("Failed to fetch media list. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaChange = (mediaId) => {
    const newMedia = mediaList.find((item) => item.id === mediaId);
    if (newMedia) {
      setCurrentMedia(newMedia);
      setActiveTab(newMedia.type);
    }
  };

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
      setDuration(mediaRef.current.duration);
    }
  };

  const handleSeek = ([value]) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = ([value]) => {
    if (mediaRef.current) {
      mediaRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  const toggleMute = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      setVolume(isMuted ? 1 : 0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    const newMedia = mediaList.find((item) => item.type === value);
    if (newMedia) {
      setCurrentMedia(newMedia);
    } else {
      setCurrentMedia(null);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePrevious = () => {
    if (!currentMedia) return;
    const currentType = currentMedia.type;
    const currentIndex = mediaList.findIndex(
      (item) => item.id === currentMedia.id,
    );
    let newIndex = currentIndex - 1;
    while (newIndex >= 0) {
      if (mediaList[newIndex].type === currentType) {
        setCurrentMedia(mediaList[newIndex]);
        break;
      }
      newIndex--;
    }
    if (newIndex < 0) {
      for (let i = mediaList.length - 1; i > currentIndex; i--) {
        if (mediaList[i].type === currentType) {
          setCurrentMedia(mediaList[i]);
          break;
        }
      }
    }
  };

  const handleNext = () => {
    if (!currentMedia) return;
    const currentType = currentMedia.type;
    const currentIndex = mediaList.findIndex(
      (item) => item.id === currentMedia.id,
    );
    let newIndex = currentIndex + 1;
    while (newIndex < mediaList.length) {
      if (mediaList[newIndex].type === currentType) {
        setCurrentMedia(mediaList[newIndex]);
        break;
      }
      newIndex++;
    }
    if (newIndex >= mediaList.length) {
      for (let i = 0; i < currentIndex; i++) {
        if (mediaList[i].type === currentType) {
          setCurrentMedia(mediaList[i]);
          break;
        }
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const showControlsTemporarily = () => {
    setShowVideoControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowVideoControls(false);
    }, 3000);
  };

  const filteredMediaList = mediaList.filter(
    (item) =>
      item.type === activeTab &&
      (item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.album.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-foreground text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-destructive text-2xl">{error}</div>
      </div>
    );
  }

  return (
    <div className={`w-full mx-auto ${theme}`}>
      <div className="top-0 left-0 right-0 bg-transparent z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb className="py-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  <Home className="h-4 w-4" />
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/discography">Discography</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {currentMedia ? currentMedia.title : "Media Player"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
      <Member />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="bg-background shadow-lg rounded-lg overflow-hidden card my-8 transition-all duration-300 ease-in-out sm:my-12">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <ToggleGroup
                type="single"
                value={activeTab}
                onValueChange={handleTabChange}
                className="justify-center"
              >
                <ToggleGroupItem
                  value="audio"
                  aria-label="Toggle audio player"
                  className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
                >
                  <Music className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Audio
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="video"
                  aria-label="Toggle video player"
                  className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
                >
                  <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Video
                </ToggleGroupItem>
              </ToggleGroup>
              <div className="flex items-center space-x-2">
                <Sun className="h-3 w-3 sm:h-4 sm:w-4" />
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                />
                <Moon className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
            </div>

            {activeTab ? (
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8">
                {activeTab === "audio" ? (
                  <>
                    <div className="w-full md:w-1/3">
                      <div className="bg-muted flex items-center justify-center rounded-lg overflow-hidden">
                        <div className="w-full pb-[100%] relative">
                          <img
                            src={currentMedia?.cover}
                            alt={`Cover for ${currentMedia?.title}`}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <audio
                        ref={mediaRef}
                        src={currentMedia?.src}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                      />
                    </div>
                    <div className="w-full md:w-2/3">
                      <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                        {currentMedia?.title}
                      </h2>
                      <p className="text-sm sm:text-base text-muted-foreground mb-2 sm:mb-3">
                        {currentMedia?.album}
                      </p>
                      <div className="mt-4 sm:mt-6">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <span className="text-xs sm:text-sm">
                            {formatTime(currentTime)}
                          </span>
                          <Slider
                            value={[currentTime]}
                            max={duration}
                            step={1}
                            onValueChange={handleSeek}
                            className="w-full mx-2 sm:mx-4"
                          />
                          <span className="text-xs sm:text-sm">
                            {formatTime(duration)}
                          </span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePrevious}
                            className="h-8 w-8 sm:h-10 sm:w-10"
                          >
                            <SkipBack className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={togglePlay}
                            className="h-8 w-8 sm:h-10 sm:w-10"
                          >
                            {isPlaying ? (
                              <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
                            ) : (
                              <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleNext}
                            className="h-8 w-8 sm:h-10 sm:w-10"
                          >
                            <SkipForward className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleMute}
                            className="h-8 w-8 sm:h-10 sm:w-10"
                          >
                            {isMuted ? (
                              <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" />
                            ) : (
                              <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          
                          </Button>
                          <Slider
                            value={[volume]}
                            max={1}
                            step={0.1}
                            onValueChange={handleVolumeChange}
                            className="w-20 sm:w-24 ml-2"
                          />
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-6">
                        <Input
                          type="text"
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full text-sm sm:text-base mb-2 sm:mb-3"
                        />
                        <div className="h-[200px] sm:h-[250px] overflow-y-auto">
                          <div className="pr-4">
                            {filteredMediaList.map((item) => (
                              <Button
                                key={item.id}
                                variant="ghost"
                                className={`w-full justify-start mb-1 sm:mb-2 py-1 sm:py-2 ${
                                  currentMedia?.id === item.id ? "bg-accent" : ""
                                }`}
                                onClick={() => handleMediaChange(item.id)}
                              >
                                <div className="flex items-center w-full">
                                  <img
                                    src={item.cover}
                                    alt={`Cover for ${item.title}`}
                                    className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3 object-cover rounded"
                                  />
                                  <div className="flex-grow flex justify-between items-center">
                                    <div className="text-sm sm:text-base font-medium">
                                      {item.title}
                                    </div>
                                    <div className="text-xs sm:text-sm text-muted-foreground">
                                      {item.album}
                                    </div>
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-full md:w-2/3" ref={containerRef}>
                      <div
                        className="relative aspect-video"
                        onMouseMove={showControlsTemporarily}
                        onMouseLeave={() => setShowVideoControls(false)}
                      >
                        <video
                          ref={mediaRef}
                          src={currentMedia?.src}
                          className="w-full h-full"
                          onTimeUpdate={handleTimeUpdate}
                          onEnded={() => setIsPlaying(false)}
                          onClick={togglePlay}
                        />
                        {showVideoControls && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white text-xs">
                                {formatTime(currentTime)}
                              </span>
                              <Slider
                                value={[currentTime]}
                                max={duration}
                                step={1}
                                onValueChange={handleSeek}
                                className="w-full mx-2"
                              />
                              <span className="text-white text-xs">
                                {formatTime(duration)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={togglePlay}
                                  className="text-white"
                                >
                                  {isPlaying ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={toggleMute}
                                  className="text-white"
                                >
                                  {isMuted ? (
                                    <VolumeX className="h-4 w-4" />
                                  ) : (
                                    <Volume2 className="h-4 w-4" />
                                  )}
                                </Button>
                                <Slider
                                  value={[volume]}
                                  max={1}
                                  step={0.1}
                                  onValueChange={handleVolumeChange}
                                  className="w-24"
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleFullscreen}
                                className="text-white"
                              >
                                {isFullscreen ? (
                                  <Minimize className="h-4 w-4" />
                                ) : (
                                  <Maximize className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full md:w-1/3">
                      <Input
                        type="text"
                        placeholder="Search videos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-sm sm:text-base mb-2 sm:mb-3"
                      />
                      <div className="h-[400px] overflow-y-auto pr-4">
                        {filteredMediaList.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-start mb-2 p-2 rounded-md ${
                              currentMedia?.id === item.id
                                ? "bg-accent"
                                : "hover:bg-accent/50"
                            } cursor-pointer transition-colors group`}
                            onClick={() => handleMediaChange(item.id)}
                          >
                            <div className="w-40 h-24 flex-shrink-0 relative">
                              <img
                                src={item.cover}
                                alt={`Thumbnail for ${item.title}`}
                                className="w-full h-full object-cover rounded"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                                <Play
                                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  size={24}
                                />
                              </div>
                            </div>
                            <div className="ml-3 flex-grow min-w-0">
                              <div className="text-sm font-medium line-clamp-2">
                                {item.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.album}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <h2 className="text-2xl font-bold text-muted-foreground">
                  Media Player
                </h2>
              </div>
            )}
          </div>
          <div className="flex justify-end p-4 sm:p-6">
            <Separator className="w-1/4" />
          </div>
        </div>

        <AlbumPerformanceChart />
        <br />
        <TabelDiscography />
      </div>

      <footer className="bg-background shadow-lg mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4">Our Sponsors</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {/* Add your sponsors here */}
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground">
              2024 Your Company Name. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}