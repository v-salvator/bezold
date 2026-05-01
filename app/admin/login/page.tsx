"use client";
import { useState } from "react";
import { Button, Card, Input, Typography, notification } from "antd";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      api.error({ message: "Please enter email and password" });
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/store/list");
    } catch {
      api.error({ message: "Login failed", description: "Invalid email or password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      {contextHolder}
      <Card style={{ width: 400 }}>
        <Typography.Title level={3} className="text-center mb-6">
          Admin Login
        </Typography.Title>
        <Typography.Title level={5}>Email</Typography.Title>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onPressEnter={handleLogin}
        />
        <Typography.Title level={5} className="mt-4">
          Password
        </Typography.Title>
        <Input.Password
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onPressEnter={handleLogin}
        />
        <Button
          type="primary"
          block
          className="mt-6"
          loading={loading}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Card>
    </div>
  );
}
