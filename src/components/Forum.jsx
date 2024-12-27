import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Paperclip, Send, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock function to simulate file upload
const uploadFile = async (file) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      });
    }, 1000);
  });
};

const initialTopics = [
  {
    id: 1,
    title: "Astro vs Next.js",
    author: "Alice",
    attachments: [],
    messages: [
      {
        id: 1,
        author: "Alice",
        content: "Apa pendapat kalian tentang Astro dibandingkan dengan Next.js?",
        attachments: [],
      },
      {
        id: 2,
        author: "Bob",
        content: "Saya lebih suka Astro untuk situs statis.",
        attachments: [],
      },
    ],
  },
  {
    id: 2,
    title: "Belajar TypeScript",
    author: "Bob",
    attachments: [],
    messages: [
      {
        id: 1,
        author: "Bob",
        content: "Ada yang punya sumber belajar TypeScript yang bagus?",
        attachments: [],
      },
    ],
  },
];

const MAX_FILE_SIZE = 7 * 1024 * 1024; // 7MB in bytes

export default function Forum() {
  const [topics, setTopics] = useState(initialTopics);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicAttachments, setNewTopicAttachments] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newMessageAttachments, setNewMessageAttachments] = useState([]);
  const { toast } = useToast();

  const handleFileUpload = (event, setAttachments) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => file.size <= MAX_FILE_SIZE);

    if (validFiles.length < files.length) {
      toast({
        title: "Peringatan",
        description: "Beberapa file melebihi batas ukuran 7MB dan tidak akan diunggah.",
        variant: "destructive",
      });
    }

    setAttachments((prevAttachments) => [...prevAttachments, ...validFiles]);
  };

  const removeAttachment = (index, attachments, setAttachments) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (newTopicTitle.trim()) {
      const uploadedAttachments = await Promise.all(
        newTopicAttachments.map(uploadFile),
      );
      const newTopic = {
        id: topics.length + 1,
        title: newTopicTitle,
        author: "Anda", // In a real app, this would be the logged-in user
        attachments: uploadedAttachments,
        messages: [],
      };
      setTopics([...topics, newTopic]);
      setNewTopicTitle("");
      setNewTopicAttachments([]);
    } else {
      toast({
        title: "Error",
        description: "Judul topik tidak boleh kosong.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((newMessage.trim() || newMessageAttachments.length > 0) && currentTopic) {
      const uploadedAttachments = await Promise.all(
        newMessageAttachments.map(uploadFile),
      );
      const updatedTopics = topics.map((topic) => {
        if (topic.id === currentTopic.id) {
          return {
            ...topic,
            messages: [
              ...topic.messages,
              {
                id: topic.messages.length + 1,
                author: "Anda",
                content: newMessage,
                attachments: uploadedAttachments,
              },
            ],
          };
        }
        return topic;
      });
      setTopics(updatedTopics);
      setNewMessage("");
      setNewMessageAttachments([]);
    } else {
      toast({
        title: "Error",
        description: "Pesan tidak boleh kosong.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="container mx-auto p-4 flex gap-4">
      <Card className="w-1/3">
        <CardHeader>
          <CardTitle>Forum Diskusi</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-bold mb-2">Daftar Topik</h2>
          <ul className="space-y-2">
            {topics.map((topic) => (
              <li key={topic.id}>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setCurrentTopic(topic)}
                >
                  {topic.attachments.length > 0 && (
                    <Paperclip className="mr-2 h-4 w-4" />
                  )}
                  {topic.title} oleh {topic.author}
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleCreateTopic} className="w-full space-y-2">
            <Input
              type="text"
              placeholder="Judul topik baru"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
            />
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  document.getElementById("topicFileUpload").click()
                }
              >
                <Paperclip className="mr-2" />
                Pilih File
              </Button>
              <Input
                id="topicFileUpload"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e, setNewTopicAttachments)}
              />
              <Button type="submit">
                <Plus className="mr-2" />
                Buat Topik
              </Button>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {newTopicAttachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-100 p-2 rounded"
                >
                  <div className="flex items-center">
                    <Paperclip className="mr-2 h-4 w-4" />
                    <span className="text-sm">
                      {file.name} ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      removeAttachment(
                        index,
                        newTopicAttachments,
                        setNewTopicAttachments,
                      )
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </form>
        </CardFooter>
      </Card>

      {currentTopic && (
        <Card className="w-2/3">
          <CardHeader>
            <CardTitle className="flex items-center">
              {currentTopic.attachments.length > 0 && (
                <Paperclip className="mr-2 h-4 w-4" />
              )}
              {currentTopic.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {currentTopic.messages.map((message) => (
                <div key={message.id} className="bg-gray-100 p-2 rounded">
                  <strong>{message.author}:</strong> {message.content}
                  {message.attachments.length > 0 && (
                    <div className="mt-2">
                      <strong>Attachments:</strong>
                      <ul className="list-disc list-inside">
                        {message.attachments.map((attachment, index) => (
                          <li key={index}>
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {attachment.name} (
                              {formatFileSize(attachment.size)})
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <form onSubmit={handleSendMessage} className="w-full space-y-2">
              <Textarea
                placeholder="Tulis pesan Anda"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("messageFileUpload").click()
                  }
                >
                  <Paperclip className="mr-2" />
                  Pilih File
                </Button>
                <Input
                  id="messageFileUpload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload(e, setNewMessageAttachments)
                  }
                />
                <Button type="submit">
                  <Send className="mr-2" />
                  Kirim
                </Button>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                {newMessageAttachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-100 p-2 rounded"
                  >
                    <div className="flex items-center">
                      <Paperclip className="mr-2 h-4 w-4" />
                      <span className="text-sm">
                        {file.name} ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        removeAttachment(
                          index,
                          newMessageAttachments,
                          setNewMessageAttachments,
                        )
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
