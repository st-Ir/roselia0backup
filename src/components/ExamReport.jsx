import React, { useState, useEffect } from 'react'
import { useToast } from "../hooks/use-toast"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { AlertCircle } from 'lucide-react'

const ExamReport = ({ examId, studentId, score }) => {
  const { toast } = useToast()
  const [reports, setReports] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reportForm, setReportForm] = useState({
    reason: '',
    additionalInfo: '',
    attachments: []
  })

  useEffect(() => {
    // Load existing reports
    loadReports()
  }, [examId, studentId])

  const loadReports = async () => {
    try {
      const response = await fetchAPI(`exam/reports/${examId}/${studentId}`)
      if (response.data) {
        setReports(response.data)
      }
    } catch (error) {
      console.error('Error loading reports:', error)
      toast({
        title: "Error",
        description: "Gagal memuat riwayat laporan",
        variant: "destructive"
      })
    }
  }

  const handleSubmitReport = async (e) => {
    e.preventDefault()
    
    if (!reportForm.reason.trim()) {
      toast({
        title: "Error",
        description: "Mohon isi alasan pengajuan ujian ulang",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('examId', examId)
      formData.append('studentId', studentId)
      formData.append('score', score)
      formData.append('reason', reportForm.reason)
      formData.append('additionalInfo', reportForm.additionalInfo)
      reportForm.attachments.forEach(file => {
        formData.append('attachments', file)
      })

      const response = await fetchAPI('exam/submit-report', {
        method: 'POST',
        body: formData
      })

      if (response.error) throw new Error(response.error)

      toast({
        title: "Sukses",
        description: "Laporan berhasil diajukan",
      })

      // Reset form
      setReportForm({
        reason: '',
        additionalInfo: '',
        attachments: []
      })

      // Reload reports
      loadReports()

    } catch (error) {
      console.error('Report submission error:', error)
      toast({
        title: "Error",
        description: "Gagal mengajukan laporan. Silakan coba lagi.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setReportForm(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  const removeAttachment = (index) => {
    setReportForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const getReportStatus = (status) => {
    const statusMap = {
      'pending': 'Menunggu Review',
      'approved': 'Disetujui',
      'rejected': 'Ditolak'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'text-yellow-600',
      'approved': 'text-green-600',
      'rejected': 'text-red-600'
    }
    return colorMap[status] || 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Form Pengajuan Laporan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Ajukan Laporan Ujian Ulang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Alasan Pengajuan</Label>
              <Textarea
                id="reason"
                placeholder="Jelaskan alasan anda mengajukan ujian ulang..."
                value={reportForm.reason}
                onChange={(e) => setReportForm(prev => ({
                  ...prev,
                  reason: e.target.value
                }))}
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Informasi Tambahan (Opsional)</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Tambahkan informasi pendukung jika ada..."
                value={reportForm.additionalInfo}
                onChange={(e) => setReportForm(prev => ({
                  ...prev,
                  additionalInfo: e.target.value
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments">Lampiran (Opsional)</Label>
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
                className="cursor-pointer"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              {reportForm.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {reportForm.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Mengirim Laporan...' : 'Kirim Laporan'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Riwayat Laporan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Riwayat Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            Laporan #{report.id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                          {getReportStatus(report.status)}
                        </span>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm font-medium">Alasan:</p>
                        <p className="text-sm text-gray-600">{report.reason}</p>
                      </div>

                      {report.additionalInfo && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Informasi Tambahan:</p>
                          <p className="text-sm text-gray-600">{report.additionalInfo}</p>
                        </div>
                      )}

                      {report.response && (
                        <div className="mt-2 p-3 bg-gray-50 rounded">
                          <p className="text-sm font-medium">Respon Admin:</p>
                          <p className="text-sm text-gray-600">{report.response}</p>
                        </div>
                      )}

                      {report.attachments && report.attachments.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Lampiran:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {report.attachments.map((attachment, i) => (
                              <a
                                key={i}
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                {attachment.filename}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              <p>Belum ada riwayat laporan</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ExamReport
