import { useMember } from '@/integrations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Image } from '@/components/ui/image';

export default function ProfilePage() {
  const { member, actions } = useMember();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await actions.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-8 bg-white rounded-xl shadow-sm">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="font-heading text-4xl text-foreground mb-2">Profile</h1>
                <p className="font-paragraph text-lg text-secondary">
                  Manage your account information
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="rounded-lg"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            <div className="space-y-6">
              {member?.profile?.photo?.url && (
                <div className="flex justify-center mb-6">
                  <Image src={member.profile.photo.url} alt={member.profile.nickname || 'Profile'} className="w-32 h-32 rounded-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-secondary mt-1" />
                    <div>
                      <p className="font-paragraph text-xs text-secondary mb-1">Display Name</p>
                      <p className="font-paragraph text-sm text-foreground">
                        {member?.profile?.nickname || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-secondary mt-1" />
                    <div>
                      <p className="font-paragraph text-xs text-secondary mb-1">Email</p>
                      <p className="font-paragraph text-sm text-foreground">
                        {member?.loginEmail || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-secondary mt-1" />
                    <div>
                      <p className="font-paragraph text-xs text-secondary mb-1">First Name</p>
                      <p className="font-paragraph text-sm text-foreground">
                        {member?.contact?.firstName || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-secondary mt-1" />
                    <div>
                      <p className="font-paragraph text-xs text-secondary mb-1">Last Name</p>
                      <p className="font-paragraph text-sm text-foreground">
                        {member?.contact?.lastName || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-secondary mt-1" />
                    <div>
                      <p className="font-paragraph text-xs text-secondary mb-1">Member Since</p>
                      <p className="font-paragraph text-sm text-foreground">
                        {member?._createdDate
                          ? new Date(member._createdDate).toLocaleDateString()
                          : 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-secondary mt-1" />
                    <div>
                      <p className="font-paragraph text-xs text-secondary mb-1">Last Login</p>
                      <p className="font-paragraph text-sm text-foreground">
                        {member?.lastLoginDate
                          ? new Date(member.lastLoginDate).toLocaleDateString()
                          : 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {member?.profile?.title && (
                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-secondary mt-1" />
                    <div>
                      <p className="font-paragraph text-xs text-secondary mb-1">Title</p>
                      <p className="font-paragraph text-sm text-foreground">
                        {member.profile.title}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
