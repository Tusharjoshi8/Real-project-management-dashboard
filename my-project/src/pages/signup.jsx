import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(formData);
    
    if (result.success) {
      navigate('/'); 
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-500 to-indigo-400 px-4 py-12">
      <Card className="w-full max-w-md shadow-2xl rounded-3xl border-none overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-indigo-400 to-blue-600" />
        <CardHeader className="space-y-1 pt-8">
          <CardTitle className="text-3xl font-black text-center text-gray-900 font-outfit uppercase tracking-tight">Create Account</CardTitle>
          <CardDescription className="text-center font-medium text-gray-500">Join the premium real-time dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-10">
          {error && (
            <Alert className="border-rose-100 bg-rose-50 rounded-2xl">
              <AlertDescription className="text-rose-600 font-bold text-xs">{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your@company.com"
                className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Secret Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Account Type</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full h-12 px-4 border-none rounded-xl bg-gray-50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-600 outline-none appearance-none"
                required
              >
                <option value="employee">Team Employee</option>
                <option value="manager">Team Manager</option>
              </select>
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Start Now'}
            </Button>
          </form>
          <div className="text-center text-sm text-gray-500 font-medium">
            Member already?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-indigo-600 hover:text-indigo-800 font-black transition-colors"
            >
              Sign In
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
