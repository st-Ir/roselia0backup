import React, { useState, useEffect, useRef, useMemo } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import jsPDF from 'jspdf'
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, Download, X, Play, Pause, ChevronUp, ChevronDown, Sun, Moon, ZoomIn, ZoomOut, User, Info, FileText, Circle, ListChecks, ArrowRight } from 'lucide-react'

// API configuration
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:2005'
const headers = {
  'Content-Type': 'application/json'
}

// Helper function to track retake history
const getRetakeHistory = () => {
  if (typeof window === 'undefined') return [];
  try {
    const retakeRequests = window.localStorage.getItem('retakeRequests');
    return retakeRequests ? JSON.parse(retakeRequests) : [];
  } catch (e) {
    return [];
  }
};

const fetchAPI = async (endpoint, options = {}) => {
  if (typeof window === 'undefined') return { data: null, error: 'Server side rendering' };
  
  try {
    const token = window.localStorage.getItem('token');
    const accessToken = window.localStorage.getItem('accessToken');
    const authToken = token || accessToken;
    
    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
        'Authorization': authToken ? `Bearer ${authToken}` : '',
        'x-access-token': authToken || ''
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return { data: [], error: null };
      }
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          const currentAnswers = window.localStorage.getItem('currentAnswers');
          const timeLeft = window.localStorage.getItem('timeLeft');
          const currentQuestionIndex = window.localStorage.getItem('currentQuestionIndex');
          
          window.localStorage.setItem('pendingExam', JSON.stringify({
            answers: currentAnswers ? JSON.parse(currentAnswers) : {},
            timeLeft: timeLeft ? parseInt(timeLeft) : 3600,
            currentQuestionIndex: currentQuestionIndex ? parseInt(currentQuestionIndex) : 0
          }));
        }
        
        console.error('Authentication failed - please login again');
        window.location.href = '/login';
        return { data: null, error: 'Authentication failed' };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Fetch error:', error);
    if (error.message.includes('404')) {
      return { data: [], error: null };
    }
    return { data: null, error: error.message };
  }
};

const examQuestions = [
  {
    id: 1,
    type: 'single',
    question: "Siapa vokalis utama band Roselia?",
    image: "/src/assets/3.png",
    options: ["Yukina Minato", "Ako Udagawa", "Sayo Hikawa", "Lisa Imai"],
    correctAnswer: ["Yukina Minato"],
    nearlyCorrect: ["Lisa Imai"]
  },
  {
    id: 2,
    type: 'image',
    question: "Manakah yang merupakan logo Roselia?",
    options: [
      "/src/assets/3.png",
      "/src/assets/1.png",
      "/src/assets/2.png",
      "/src/assets/icon.png"
    ],
    correctAnswer: ["/src/assets/3.png"],
    nearlyCorrect: ["/src/assets/icon.png"]
  },
  {
    id: 3,
    type: 'single',
    question: "Dengarkanlah lagu berikut, dan pilih judul yang benar:",
    audio: "https://bestdori.com/assets/en/sound/bgm168_rip/bgm168.mp3",
    options: ["Nesshoku Starmine", "yakusoku", "safe and sound", "Sanctuary"],
    correctAnswer: ["safe and sound"],
    nearlyCorrect: []
  },
  {
    id: 4,
    type: 'order',
    question: "Urutkan album studio Roselia dari yang paling lama dirilis hingga yang terbaru:",
    options: [
      "Anfang",
      "Era",
      "Rozen Horizon"
    ],
    correctAnswer: ["Anfang", "Era", "Rozen Horizon"],
    nearlyCorrect: []
  },
  {
    id: 5,
    type: 'multiple',
    question: "Pilih lagu-lagu yang merupakan single Roselia:",
    options: ["FIRE BIRD", "Determination Symphony", "LOUDER", "Starmine", "R", "Neo-Aspect"],
    correctAnswer: ["FIRE BIRD", "LOUDER", "Neo-Aspect"],
    nearlyCorrect: []
  },
  {
    id: 6,
    type: 'single',
    question: "Siapakah yang memegang posisi gitaris di Roselia?",
    options: ["Sayo Hikawa", "Lisa Imai", "Rinko Shirokane", "Ako Udagawa"],
    correctAnswer: ["Sayo Hikawa"],
    nearlyCorrect: []
  },
  {
    id: 8,
    type: 'multiple',
    question: "Pilih lagu-lagu yang dinyanyikan Roselia di BanG Dream! Film Live:",
    options: ["Neo-Aspect", "Brave Jewel", "FIRE BIRD", "Determination Symphony", "R"],
    correctAnswer: ["Neo-Aspect", "Brave Jewel"],
    nearlyCorrect: []
  },
  {
    id: 9,
    type: 'single',
    question: "Siapa yang memainkan keyboard di Roselia?",
    options: ["Rinko Shirokane", "Lisa Imai", "Ako Udagawa", "Sayo Hikawa"],
    correctAnswer: ["Rinko Shirokane"],
    nearlyCorrect: []
  },
  {
    id: 10,
    type: 'matching',
    question: "Cocokkan anggota Roselia dengan instrumen mereka:",
    options: {
      members: ["Yukina Minato", "Sayo Hikawa", "Lisa Imai", "Ako Udagawa", "Rinko Shirokane"],
      instruments: ["Vokal", "Gitar", "Bass", "Drum", "Keyboard"]
    },
    correctAnswer: {
      "Yukina Minato": "Vokal",
      "Sayo Hikawa": "Gitar",
      "Lisa Imai": "Bass",
      "Ako Udagawa": "Drum",
      "Rinko Shirokane": "Keyboard"
    },
    nearlyCorrect: []
  },
  {
    id: 11,
    type: 'single',
    question: "Apa nama sekolah yang dihadiri oleh Yukina Minato?",
    options: ["Haneoka Girls' High School", "Hanasakigawa Girls' High School", "Tsukinomori Girls' Academy", "Celosia Girls' High School"],
    correctAnswer: ["Haneoka Girls' High School"],
    nearlyCorrect: []
  },
  {
    id: 12,
    type: 'multiple',
    question: "Pilih karakter yang bersekolah di Haneoka Girls' High School:",
    options: ["Yukina Minato", "Lisa Imai", "Sayo Hikawa", "Rinko Shirokane", "Ako Udagawa"],
    correctAnswer: ["Yukina Minato", "Lisa Imai"],
    nearlyCorrect: []
  },
  {
    id: 13,
    type: 'true-false',
    question: "Apakah Sayo Hikawa dan Hina Hikawa adalah saudara kembar?",
    options: ["True", "False"],
    correctAnswer: ["True"],
    nearlyCorrect: []
  },
  {
    id: 14,
    type: 'single',
    question: "Apa warna rambut Lisa Imai?",
    options: ["Cokelat", "Hitam", "Biru", "Merah"],
    correctAnswer: ["Cokelat"],
    nearlyCorrect: []
  },
  {
    id: 15,
    type: 'multiple',
    question: "Pilih lagu-lagu yang ada di album 'Era':",
    options: ["FIRE BIRD", "R", "Neo-Aspect", "Determination Symphony", "BRAVE JEWEL"],
    correctAnswer: ["FIRE BIRD", "Neo-Aspect", "BRAVE JEWEL"],
    nearlyCorrect: []
  },
  {
    id: 16,
    type: 'single',
    question: "Apa merek gitar yang digunakan Sayo Hikawa?",
    options: ["ESP", "Fender", "Gibson", "Ibanez"],
    correctAnswer: ["ESP"],
    nearlyCorrect: []
  },
  {
    id: 18,
    type: 'multiple',
    question: "Pilih spesifikasi yang benar tentang drum Ako Udagawa:",
    options: ["Pearl Reference", "22\" Bass Drum", "14\" Snare", "Zildjian Cymbals", "Maple Shell", "Brass Snare"],
    correctAnswer: ["Pearl Reference", "22\" Bass Drum", "Zildjian Cymbals"],
    nearlyCorrect: []
  },
  {
    id: 22,
    type: 'multiple',
    question: "Pilih aksesori yang digunakan Sayo Hikawa saat bermain gitar:",
    options: ["Pick ESP Custom", "Strap Lock", "Volume Pedal", "Distortion Pedal", "Delay Pedal"],
    correctAnswer: ["Pick ESP Custom", "Strap Lock", "Distortion Pedal"],
    nearlyCorrect: []
  },
  {
    id: 23,
    type: 'single',
    question: "Apa warna gitar signature Sayo Hikawa?",
    options: ["Biru Teal", "Biru Navy", "Biru Electric", "Biru Aqua"],
    correctAnswer: ["Biru Teal"],
    nearlyCorrect: ["Biru Electric"]
  },
  {
    id: 24,
    type: 'multiple',
    question: "Pilih perangkat yang ada di setup keyboard Rinko:",
    options: ["Roland RD-2000", "Sustain Pedal", "Expression Pedal", "MIDI Controller", "Audio Interface"],
    correctAnswer: ["Roland RD-2000", "Sustain Pedal", "Expression Pedal"],
    nearlyCorrect: []
  },
  {
    id: 27,
    type: 'single',
    question: "Apa merek efek yang digunakan Lisa untuk bass-nya?",
    options: ["Boss", "MXR", "Darkglass", "Tech 21"],
    correctAnswer: ["Darkglass"],
    nearlyCorrect: []
  },
  {
    id: 28,
    type: 'multiple',
    question: "Pilih spesifikasi yang benar tentang mikrofon Yukina:",
    options: ["Shure SM58", "Wireless System", "Gold Plated", "Pop Filter", "Shock Mount"],
    correctAnswer: ["Shure SM58", "Wireless System", "Pop Filter"],
    nearlyCorrect: []
  },
  {
    id: 29,
    type: 'single',
    question: "Berapa total channel yang digunakan di mixer Roselia saat live?",
    options: ["16 Channel", "24 Channel", "32 Channel", "48 Channel"],
    correctAnswer: ["32 Channel"],
    nearlyCorrect: ["24 Channel"]
  },
  {
    id: 30,
    type: 'matching',
    question: "Cocokkan anggota Roselia dengan merek alat musik mereka:",
    options: {
      members: ["Sayo Hikawa", "Lisa Imai", "Ako Udagawa", "Rinko Shirokane"],
      instruments: ["ESP", "Fender", "Pearl", "Roland"]
    },
    correctAnswer: {
      "Sayo Hikawa": "ESP",
      "Lisa Imai": "Fender",
      "Ako Udagawa": "Pearl",
      "Rinko Shirokane": "Roland"
    },
    nearlyCorrect: []
  }
]

const QuestionRenderer = ({ question, answer, onAnswerChange, isPlaying, toggleAudio, audioRef, hotspotRef, handleHotspotClick, handleDragEnd, moveItem, isDarkMode }) => {
  switch (question.type) {
    case 'single':
      return (
        <RadioGroup
          onValueChange={(value) => onAnswerChange('single', value)}
          value={answer?.[0]}
          className="space-y-4"
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <RadioGroupItem 
                value={option} 
                id={`option-${index}`}
                className="w-5 h-5"
              />
              <Label 
                htmlFor={`option-${index}`}
                className={`text-base cursor-pointer select-none transition-all duration-200 ${
                  answer?.[0] && answer[0] !== option ? 'line-through opacity-50' : ''
                }`}
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )
    case 'image':
      return (
        <RadioGroup
          onValueChange={(value) => onAnswerChange('image', value)}
          value={answer?.[0]}
        >
          <div className="grid grid-cols-2 gap-6 md:gap-6 gap-y-3 max-w-3xl mx-auto p-4">
            {question.options.map((option, index) => (
              <div key={index} className="flex justify-center items-center">
                <RadioGroupItem value={option} id={`option-${index}`} className="sr-only" />
                <Label
                  htmlFor={`option-${index}`}
                  className={`cursor-pointer border-4 rounded-lg md:w-[280px] md:h-[280px] w-[150px] h-[150px] flex items-center justify-center overflow-hidden transition-all duration-200 hover:border-gray-400 ${
                    answer?.[0] === option ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img 
                    src={option} 
                    alt={`Option ${index + 1}`} 
                    className={`w-full h-full object-contain p-2 transition-all duration-200 ${
                      answer?.[0] && answer[0] !== option ? 'grayscale opacity-50' : ''
                    }`}
                  />
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )
    case 'multiple':
      return (
        <div className="space-y-4">
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`option-${index}`}
                checked={(answer || []).includes(option)}
                onCheckedChange={(checked) => onAnswerChange('multiple', option, checked)}
              />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </div>
      )
    case 'order':
      return (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="options">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {(answer || question.options).map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center p-2 bg-card rounded-lg shadow cursor-move"
                      >
                        <img src={item.image} alt={item.label} className="w-16 h-16 mr-4 rounded" />
                        <span className="flex-grow">{item.label}</span>
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItem(index, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItem(index, 'down')}
                            disabled={index === (answer || question.options).length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )
    case 'fill-in-the-blank':
      return (
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Ketik jawaban Anda di sini"
            value={answer?.[0]}
            onChange={(e) => onAnswerChange('fill-in-the-blank', e.target.value)}
          />
        </div>
      )
    case 'true-false':
      return (
        <RadioGroup
          onValueChange={(value) => onAnswerChange('true-false', value)}
          value={answer?.[0]}
          className="space-y-4"
        >
          {['True', 'False'].map((option, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <RadioGroupItem 
                value={option} 
                id={`true-false-${index}`}
                className="w-5 h-5"
              />
              <Label 
                htmlFor={`true-false-${index}`}
                className={`text-base cursor-pointer select-none transition-all duration-200 ${
                  answer?.[0] && answer[0] !== option ? 'line-through opacity-50' : ''
                }`}
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )
    case 'matching':
      return (
        <div className="space-y-4">
          {question.options.members.map((member, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Label className={`w-1/3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} w-1/3`}>{member}</Label>
              <select
                className={`w-2/3 p-2 rounded transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-900/30 border-gray-800 text-gray-300' 
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
                value={answer?.[member] || ""}
                onChange={(e) => onAnswerChange('matching', { [member]: e.target.value })}
              >
                <option value="" className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>Select an instrument</option>
                {question.options.instruments.map((instrument, i) => (
                  <option 
                    key={i} 
                    value={instrument}
                    className={isDarkMode ? 'bg-gray-900' : 'bg-white'}
                  >
                    {instrument}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )
    case 'essay':
      return (
        <div className="space-y-2">
          <Textarea
            placeholder="Tulis jawaban esai Anda di sini"
            value={answer?.[0]}
            onChange={(e) => onAnswerChange('essay', e.target.value)}
            rows={6}
          />
          <p className="text-sm text-muted-foreground">Batas kata: {question.wordLimit} kata</p>
        </div>
      )
    case 'sequence':
      return (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="options">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {(answer || question.options).map((item, index) => (
                  <Draggable key={index} draggableId={index.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center p-2 bg-card rounded-lg shadow cursor-move"
                      >
                        <span className="flex-grow">{item}</span>
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItem(index, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItem(index, 'down')}
                            disabled={index === (answer || question.options).length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )
    case 'hotspot':
      return (
        <div className="relative">
          <img
            ref={hotspotRef}
            src={question.image}
            alt="Hotspot Question"
            className="w-full h-auto cursor-crosshair object-cover rounded-lg"
            onClick={handleHotspotClick}
          />
          {answer && (
            <div
              className="absolute w-4 h-4 bg-primary rounded-full border-2 border-white"
              style={{
                left: answer.x - 2,
                top: answer.y - 2,
              }}
            />
          )}
        </div>
      )
    default:
      return null
  }
}

const ConfirmationScreen = ({ onStart, loggedInUser }) => {
  return (
    <Card className="w-full max-w-4xl mx-auto border-0 ">
      <CardHeader className="text-center border-0 pb-6">
        <CardTitle className="text-3xl font-bold">Ujian Roselia</CardTitle>
        <p className="text-muted-foreground mt-2">Selamat datang di ujian pengetahuan Roselia</p>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        {/* User Data Section */}
        <div className="bg-muted/50 p-6 rounded-lg space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />  
            Data Peserta
          </h3>
          <div className="grid gap-0 pl-6 grid-cols-1">
            <div className="space-y-0">
              <p className="font-medium text-sm text-muted-foreground">{loggedInUser?.name || 'N/A'}</p>
            </div>
            <div className="space-y-0">
              <p className="font-medium text-sm text-muted-foreground">{loggedInUser?.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Exam Information Section */}
        <div className="space-y-4 pl-4">
          <div className="grid  gap-6 grid-cols-2">
            <Card className="border-0 p-10 bg-card/50">
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Struktur Ujian</h4>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Circle className="h-2 w-2 fill-current" />
                    <span>13 pertanyaan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Circle className="h-2 w-2 fill-current" />
                    <span>Waktu: 60 menit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Circle className="h-2 w-2 fill-current" />
                    <span>Nilai minimum: 8.0</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-0 p-10 bg-card/50">
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 mb-4">
                  <ListChecks className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Tipe Soal</h4>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Circle className="h-2 w-2 fill-current" />
                    <span>Pilihan Ganda</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Circle className="h-2 w-2 fill-current" />
                    <span>Menjodohkan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Circle className="h-2 w-2 fill-current" />
                    <span>Mengurutkan</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Important Notice */}
        <Alert className="border-2 border-yellow-500/20 bg-yellow-500/10">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <AlertTitle className="text-yellow-600 font-semibold">Penting</AlertTitle>
          <AlertDescription className="text-yellow-600/90">
            Pastikan koneksi internet Anda stabil dan jangan menutup atau me-refresh halaman selama ujian berlangsung.
          </AlertDescription>
        </Alert>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-4 border-t pt-6">
        <Button 
          onClick={onStart}
          className="w-full md:w-auto px-8 py-6 text-lg font-semibold"
        >
          Mulai Ujian
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Dengan mengklik tombol di atas, Anda setuju untuk mengikuti ujian sesuai dengan ketentuan yang berlaku
        </p>
      </CardFooter>
    </Card>
  );
};

const CompletionScreen = ({ score, passed, generateCertificate }) => {
  const { toast } = useToast();
  const [retakeReason, setRetakeReason] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [previousAttempts, setPreviousAttempts] = useState(0);

  useEffect(() => {
    const retakeHistory = getRetakeHistory();
    setPreviousAttempts(retakeHistory.length);
  }, []);

  const handleRetakeRequest = async () => {
    if (!retakeReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for retaking the exam",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const response = await fetchAPI('exam/retake-request', {
        method: 'POST',
        body: JSON.stringify({
          studentId: loggedInUser?.studentId,
          previousScore: score,
          reason: retakeReason,
          examDate: new Date().toISOString(),
          attemptNumber: previousAttempts + 1
        })
      });

      if (response.error) throw new Error(response.error);

      toast({
        title: "Success",
        description: "Your retake request has been submitted successfully",
      });

      const retakeRequests = JSON.parse(window.localStorage.getItem('retakeRequests') || '[]');
      retakeRequests.push({
        date: new Date().toISOString(),
        reason: retakeReason,
        status: 'pending',
        score: score
      });
      window.localStorage.setItem('retakeRequests', JSON.stringify(retakeRequests));

    } catch (error) {
      console.error('Retake request error:', error);
      toast({
        title: "Error",
        description: "Failed to submit retake request. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  if (passed) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 py-12">
          <h2 className="text-3xl font-bold">Anda Telah Lulus Ujian Roselia</h2>
          <div className="space-y-4">
            <p className="text-lg">Selamat! Anda telah berhasil menyelesaikan ujian Roselia dengan skor {score}.</p>
            <p className="text-gray-600">Anda tidak perlu mengambil ujian lagi.</p>
            <div className="flex justify-center">
              <Button 
                onClick={generateCertificate}
                className="py-4 px-8 bg-black hover:bg-gray-800 text-white dark:text-black text-lg font-medium rounded-lg transition-all duration-200"
              >
                <Download className="mr-2 h-5 w-5 inline" /> Unduh Sertifikat Roselia
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <Card className="w-full border-0 shadow-none">
        <CardHeader className="space-y-1 pb-16">
          <CardTitle className="text-2xl font-bold text-center">
            Exam Results
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Final Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{score.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">out of 10.0</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">FAILED</div>
                <p className="text-xs text-muted-foreground">
                  Minimum passing score: 8.0
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Attempt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{previousAttempts + 1}</div>
                <p className="text-xs text-muted-foreground">Total attempts made</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Alert variant="destructive" className="border-0 bg-red-500/10">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-600 dark:text-red-400">Exam Failed</AlertTitle>
              <AlertDescription className="text-red-600/90 dark:text-red-400/90">
                Unfortunately, you did not meet the minimum passing score. You may request a retake below.
              </AlertDescription>
            </Alert>
            <Card className="border-0 bg-card/50">
              <CardHeader>
                <CardTitle>Request Exam Retake</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="retake-reason">Reason for Retake</Label>
                  <Textarea
                    id="retake-reason"
                    placeholder="Please explain why you need to retake the exam..."
                    value={retakeReason}
                    onChange={(e) => setRetakeReason(e.target.value)}
                    className="min-h-[100px] bg-background"
                  />
                </div>
                <Button
                  onClick={handleRetakeRequest}
                  disabled={isSubmittingRequest}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isSubmittingRequest ? 'Submitting Request...' : 'Submit Retake Request'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Component = ({ user }) => {
  const [answers, setAnswers] = useState({})
  const [score, setScore] = useState(0)
  const [finalScore, setFinalScore] = useState(0)
  const [examStage, setExamStage] = useState('confirmation')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(3600)
  const [passed, setPassed] = useState(false)
  const [hasPassed, setHasPassed] = useState(false)
  const [previousScore, setPreviousScore] = useState(null)
  const [previousAttempts, setPreviousAttempts] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [displayedQuestions, setDisplayedQuestions] = useState([])
  const [shuffledQuestions, setShuffledQuestions] = useState([])
  const [loggedInUser, setLoggedInUser] = useState({

    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Unnamed User",
    email: user?.email || "No email provided",
    studentId: user?.id || "No ID available"
  })

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedUser = window.localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setLoggedInUser({
          name: userData.user_metadata?.full_name || userData.email?.split('@')[0] || "Unnamed User",
          email: userData.email || "No email provided",
          studentId: userData.id || "No ID available"
        })
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }
  }, [])

  const [showWarning, setShowWarning] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [textSize, setTextSize] = useState(16) 
  const [isDarkMode, setIsDarkMode] = useState(false) 
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef(null)
  const hotspotRef = useRef(null)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const increaseTextSize = () => {
    setTextSize(prev => Math.min(prev + 2, 24)) 
  }

  const decreaseTextSize = () => {
    setTextSize(prev => Math.max(prev - 2, 12)) 
  }

  const renderControls = () => {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center ${isDarkMode ? 'bg-black/90 border-gray-800' : 'bg-white/80 border-gray-200'} rounded-full px-3 py-1.5 shadow-lg space-x-1`}> 
          <button
            onClick={decreaseTextSize}
            className={`text-gray-400 hover:text-white p-1 rounded-full transition-colors`}
            title="Decrease text size"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} w-8 text-center`}>{textSize}px</span>
          <button
            onClick={increaseTextSize}
            className={`text-gray-400 hover:text-white p-1 rounded-full transition-colors`}
            title="Increase text size"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-4 bg-gray-800" />
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`text-gray-400 hover:text-white p-1 rounded-full transition-colors`}
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    )
  }

  const renderWarning = () => {
    if (!showWarning) return null;
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        <Alert variant="destructive" className={`${
          isDarkMode 
            ? 'bg-gray-900/30 border-gray-800 text-gray-300' 
            : 'bg-gray-50 border-gray-800 text-gray-700'
        } shadow-lg`}> 
          <AlertCircle className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          <AlertTitle className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Warning</AlertTitle>
          <AlertDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}> 
            Please do not refresh the page during the exam.
          </AlertDescription>
          <button
            onClick={() => setShowWarning(false)}
            className={`absolute top-2 right-2 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-300' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      </div>
    );
  };

  const startTimer = () => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }

  const handleStart = async () => {
    const examPassed = window.localStorage.getItem('examPassed') === 'true';
    if (examPassed) {
      setExamStage('completed');
      const lastResult = JSON.parse(window.localStorage.getItem('lastExamResult') || '{}');
      setScore(lastResult.score || 0);
      setPassed(true);
      return;
    }

    const shuffled = [...examQuestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 13);
    
    setShuffledQuestions(shuffled);
    setDisplayedQuestions(shuffled);
    setExamStage('exam');
    setTimeLeft(3600);
    startTimer();
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const examPassed = window.localStorage.getItem('examPassed') === 'true';
      const lastResult = JSON.parse(window.localStorage.getItem('lastExamResult') || '{}');
      
      if (examPassed) {
        setExamStage('completed');
        setScore(lastResult.score || 0);
        setHasPassed(true);
        setPassed(true);
        setPreviousScore(lastResult.score || 0);
        return; // Exit early if already passed
      }

      // For non-passed users, check previous attempts
      if (loggedInUser?.studentId) {
        checkPreviousExam();
      } else {
        setExamStage('confirmation');
        setPreviousScore(null);
        setPreviousAttempts(0);
        setHasPassed(false);
      }
    }
    setIsLoading(false);
  }, [loggedInUser]);

  const checkPreviousExam = async () => {
    try {
      console.log('Checking previous exam for user:', loggedInUser.studentId);
      
      const { data: examResults, error } = await fetchAPI(`results/${loggedInUser.studentId}`);

      if (error) {
        console.error('Error fetching exam results:', error);
        // Set default state for new users or error cases
        setExamStage('confirmation');
        setPreviousScore(null);
        setPreviousAttempts(0);
        setHasPassed(false);
        return;
      }

      if (examResults && examResults.length > 0) {
        const lastResult = examResults[0];
        setPreviousScore(lastResult.score);
        setPreviousAttempts(examResults.length);
        const passed = lastResult.score >= 8;
        setHasPassed(passed);
        setExamStage(passed ? 'completed' : 'confirmation');
      } else {
        // New user with no previous attempts
        setExamStage('confirmation');
        setPreviousScore(null);
        setPreviousAttempts(0);
        setHasPassed(false);
      }
    } catch (error) {
      console.error('Error:', error);
      // Set safe defaults for error state
      setExamStage('confirmation');
      setPreviousScore(null);
      setPreviousAttempts(0);
      setHasPassed(false);
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestion = useMemo(() => 
    displayedQuestions[currentQuestionIndex], 
    [displayedQuestions, currentQuestionIndex]
  )

  const handleAnswerChange = (questionType, value, isChecked) => {
    if (questionType === 'single' || questionType === 'image' || questionType === 'true-false') {
      setAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: [value]
      }))
    } else if (questionType === 'multiple') {
      const currentAnswers = answers[currentQuestionIndex] || []
      let newAnswers
      if (isChecked) {
        newAnswers = [...currentAnswers, value]
      } else {
        newAnswers = currentAnswers.filter(answer => answer !== value)
      }
      setAnswers({
        ...answers,
        [currentQuestionIndex]: newAnswers
      })
    } else if (questionType === 'fill-in-the-blank' || questionType === 'essay') {
      setAnswers({
        ...answers,
        [currentQuestionIndex]: [value]
      })
    } else if (questionType === 'matching') {
      setAnswers({
        ...answers,
        [currentQuestionIndex]: { ...answers[currentQuestionIndex], ...value }
      })
    } else if (questionType === 'sequence') {
      setAnswers({
        ...answers,
        [currentQuestionIndex]: value
      })
    } else if (questionType === 'hotspot') {
      setAnswers({
        ...answers,
        [currentQuestionIndex]: value
      })
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < displayedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setIsPlaying(false)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setIsPlaying(false)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }

  const calculateScore = () => {
    let totalScore = 0
    displayedQuestions.forEach((question, index) => {
      const userAnswer = answers[index] || []
      if (userAnswer.length === 0) {
        totalScore -= 2 
      } else if (question.type === 'order' || question.type === 'sequence') {
        const correctOrder = question.correctAnswer
        const correctPositions = userAnswer.filter((item, index) => item === correctOrder[index]).length
        totalScore += correctPositions 
      } else if (question.type === 'matching') {
        const correctMatches = Object.keys(question.correctAnswer).filter(key => 
          question.correctAnswer[key] === userAnswer[key]
        ).length
        totalScore += correctMatches * 2 
      } else if (question.type === 'essay') {
        totalScore += userAnswer[0] ? 5 : 0
      } else if (question.type === 'hotspot') {
        const { x, y } = userAnswer
        const { x: correctX, y: correctY, radius } = question.correctAnswer
        const distance = Math.sqrt(Math.pow(x - correctX, 2) + Math.pow(y - correctY, 2))
        if (distance <= radius) {
          totalScore += 5 
        }
      } else {
        const correctAnswers = question.correctAnswer.filter(answer => userAnswer.includes(answer))
        const incorrectAnswers = userAnswer.filter(answer => !question.correctAnswer.includes(answer))
        totalScore += correctAnswers.length * 4 
        totalScore -= incorrectAnswers.length * 2 
      }
    })
    return Math.max(totalScore, 0) 
  }

  const handleSubmit = async () => {
    if (isSubmitting || typeof window === 'undefined') return;
    
    setIsSubmitting(true);
    const finalScore = calculateScore();
    const hasPassed = finalScore >= 8;

    // Set all required states immediately
    setExamStage('completed');
    setFinalScore(finalScore);
    setScore(finalScore);
    setPassed(hasPassed); 
    setHasPassed(hasPassed);
    setPreviousScore(finalScore);
    setPreviousAttempts((prev) => prev + 1);

    const examResult = {
      student_id: loggedInUser?.studentId,
      score: finalScore,
      passed: hasPassed,
      answers: answers,
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage before API call
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lastExamResult', JSON.stringify(examResult));
      if (hasPassed) {
        window.localStorage.setItem('examPassed', 'true');
      }
    }

    try {
      const response = await fetchAPI('exam/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(examResult)
      });

      if (response.error) {
        console.warn('API submission failed, results saved locally');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Could not save results to server, but your results are saved locally');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const generateCertificate = () => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Add background color
    pdf.setFillColor(251, 251, 251);
    pdf.rect(0, 0, 297, 210, 'F');

    // Add decorative border
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(10, 10, 277, 190);
    pdf.setLineWidth(0.2);
    pdf.rect(12, 12, 273, 186);

    // Add certificate title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(36);
    pdf.setTextColor(44, 62, 80);
    pdf.text('Certificate of Completion', 148.5, 40, { align: 'center' });

    // Add Roselia text with styling
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.setTextColor(52, 73, 94);
    pdf.text('Roselia Knowledge Test', 148.5, 55, { align: 'center' });

    // Add decorative line
    pdf.setDrawColor(52, 73, 94);
    pdf.setLineWidth(0.5);
    pdf.line(74, 60, 223, 60);

    // Add "presented to" text
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(16);
    pdf.setTextColor(85, 85, 85);
    pdf.text('This certificate is presented to:', 148.5, 80, { align: 'center' });

    // Add recipient name
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(28);
    pdf.setTextColor(44, 62, 80);
    pdf.text(loggedInUser.name, 148.5, 95, { align: 'center' });

    // Add description
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(14);
    pdf.setTextColor(85, 85, 85);
    pdf.text(
      'for successfully completing the Roselia Knowledge Test\nwith outstanding performance and achieving a score of:',
      148.5, 115, 
      { align: 'center' }
    );

    // Add score
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.setTextColor(44, 62, 80);
    pdf.text(`${score.toFixed(1)} points`, 148.5, 135, { align: 'center' });

    // Add date
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor(85, 85, 85);
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    pdf.text(`Issued on ${dateStr}`, 148.5, 150, { align: 'center' });

    // Add certificate ID
    const certificateId = `ROS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    pdf.setFontSize(10);
    pdf.text(`Certificate ID: ${certificateId}`, 148.5, 160, { align: 'center' });

    // Add signature lines
    pdf.setDrawColor(85, 85, 85);
    pdf.setLineWidth(0.2);
    
    // Signature line 1
    pdf.line(40, 180, 120, 180);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.text('Yukina Minato', 80, 185, { align: 'center' });
    pdf.setFontSize(10);
    pdf.text('Lead Vocalist', 80, 190, { align: 'center' });

    // Signature line 2
    pdf.line(177, 180, 257, 180);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.text('Sayo Hikawa', 217, 185, { align: 'center' });
    pdf.setFontSize(10);
    pdf.text('Lead Guitarist', 217, 190, { align: 'center' });

    // Add verification text
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      'This certificate verifies completion of the Roselia Knowledge Test. To verify authenticity,\nplease contact our certification team.',
      148.5, 200,
      { align: 'center' }
    );

    // Save the PDF
    pdf.save('Roselia_Certificate.pdf');
  };

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return

    const currentQuestion = displayedQuestions[currentQuestionIndex]
    const items = Array.from(answers[currentQuestionIndex] || currentQuestion.options)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setAnswers({
      ...answers,
      [currentQuestionIndex]: items
    })
  }

  const moveItem = (index, direction) => {
    const currentQuestion = displayedQuestions[currentQuestionIndex]
    const items = Array.from(answers[currentQuestionIndex] || currentQuestion.options)
    if (direction === 'up' && index > 0) {
      [items[index - 1], items[index]] = [items[index], items[index - 1]]
    } else if (direction === 'down' && index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]]
    }
    setAnswers({
      ...answers,
      [currentQuestionIndex]: items
    })
  }

  const handleHotspotClick = (event) => {
    if (hotspotRef.current) {
      const rect = hotspotRef.current.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      handleAnswerChange('hotspot', { x, y })
    }
  }

  if (examStage === 'confirmation') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        {renderControls()}
        <ConfirmationScreen onStart={handleStart} loggedInUser={loggedInUser} />
      </div>
    )
  }

  if (examStage === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <CompletionScreen score={score} passed={passed} generateCertificate={generateCertificate} />
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-black text-gray-100' : 'bg-white text-gray-900'}`}> 
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-3xl"> 
          <Card className={`bg-transparent border-none ${isDarkMode ? 'bg-black/95' : 'bg-white'}`}> 
            <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-4 border-none`}> 
              <CardTitle className="text-2xl font-bold">Pertanyaan {currentQuestionIndex + 1}</CardTitle>
              <div className="flex items-center space-x-4"> 
                <div className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} w-1/3`}> 
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-4 px-6"> 
              <div className="space-y-6"> 
                <div 
                  className={`text-lg font-medium p-4 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-900/30' 
                      : 'bg-gray-50/50'
                  }`} 
                  style={{ fontSize: `${textSize}px` }}
                > 
                  {currentQuestion.question}
                </div>
                {currentQuestion.audio && (
                  <div className="flex flex-col items-center justify-center gap-2 mb-4">
                    <audio ref={audioRef} src={currentQuestion.audio} className="hidden" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleAudio}
                      className="w-10 h-10"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                )}
                <div className={`p-4 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-900/20' 
                    : 'bg-gray-50/30'
                }`}> 
                  <QuestionRenderer
                    question={currentQuestion}
                    answer={answers[currentQuestionIndex]}
                    onAnswerChange={handleAnswerChange}
                    isPlaying={isPlaying}
                    toggleAudio={toggleAudio}
                    audioRef={audioRef}
                    hotspotRef={hotspotRef}
                    handleHotspotClick={handleHotspotClick}
                    handleDragEnd={handleDragEnd}
                    moveItem={moveItem}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className={`flex justify-between pt-4 px-6 border-none`}> 
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`${
                  isDarkMode 
                    ? 'border-gray-800 hover:bg-gray-900 text-gray-300 hover:text-white' 
                    : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                }`}
              > 
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              {currentQuestionIndex === displayedQuestions.length - 1 ? (
                <Button 
                  onClick={handleSubmit} 
                  className={`${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-black' 
                      : 'bg-black hover:bg-gray-800 text-white'
                  }`}
                >
                  Submit
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleNextQuestion}
                  className={`${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-black' 
                      : 'bg-black hover:bg-gray-800 text-white'
                  }`}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
      {renderWarning()}
    </div>
  )
}

export const prerender = false;
export const client = "only";
export default Component