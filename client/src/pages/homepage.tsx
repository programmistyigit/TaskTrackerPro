import { Shield, Lock, CheckCircle, AlertTriangle, Users, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TelegramSecurityHomepage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Telegram Security</h1>
                <p className="text-sm text-gray-500">Professional Security Service</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              Invitation Only
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Telegram Havfsizlik Xizmati
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Professional darajadagi havfsizlik va autentifikatsiya xizmati. 
                Sizning Telegram hisobingizni maksimal darajada himoya qilish uchun yaratilgan.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <h3 className="text-lg font-semibold text-amber-800">Faqat Taklif Orqali</h3>
              </div>
              <p className="text-amber-700 leading-relaxed">
                Ushbu xizmat faqat maxsus taklif orqali foydalanish mumkin. 
                Agar sizda taklif havolasi bo'lsa, uni orqali kirish amalga oshiring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              Xavfsizlik Xususiyatlari
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-gray-100 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">2FA Autentifikatsiya</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center leading-relaxed">
                    Ikki bosqichli autentifikatsiya orqali hisobingizni qo'shimcha himoya qatlami bilan mustahkamlang.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-gray-100 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Tahdid Aniqlash</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center leading-relaxed">
                    Real vaqtda tahdidlarni aniqlash va ularni bartaraf etish tizimi orqali doimiy himoya.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-gray-100 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Maxsus Yordam</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center leading-relaxed">
                    24/7 professional yordam xizmati orqali har qanday xavfsizlik masalalarini hal qiling.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Aloqa</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Agar sizda savollar bo'lsa yoki qo'shimcha ma'lumot kerak bo'lsa, 
              bizning yordam xizmatimiz bilan bog'laning.
            </p>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Professional Yordam</p>
              <p className="text-lg font-semibold text-gray-900">security@telegram-service.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Telegram Security</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2025 Telegram Security Service. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </footer>
    </div>
  );
}