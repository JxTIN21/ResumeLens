import React, { useState, useEffect, useCallback } from "react";
import {
  Upload,
  FileText,
  BarChart3,
  CheckCircle,
  AlertCircle,
  User,
  LogOut,
  Eye,
  TrendingUp,
  Target,
  Award,
  BookOpen,
  Brain,
  Zap,
  Star,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const API_BASE_URL = "http://localhost:5000/api";

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentView, setCurrentView] = useState("login");
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize authentication state
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setCurrentView("dashboard");
    }
    setIsInitialized(true);
  }, []);

  // Auto-dismiss messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchUserAnalyses = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/analyses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data);
      }
    } catch (err) {
      console.error("Failed to fetch analyses:", err);
    }
  }, [token]);

  useEffect(() => {
    if (token && isInitialized) {
      fetchUserAnalyses();
    }
  }, [token, fetchUserAnalyses, isInitialized]);

  const handleAuth = async (endpoint, data) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setToken(result.token);
        setUser(result.user);
        localStorage.setItem("token", result.token);
        setSuccess(result.message);
        setCurrentView("dashboard");
        fetchUserAnalyses();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Network error occurred");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    setCurrentView("login");
    setAnalyses([]);
    setSelectedAnalysis(null);
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload-resume`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("Resume analyzed successfully!");
        fetchUserAnalyses();
        setSelectedAnalysis(result.analysis);
        setCurrentView("analysis");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to upload resume");
    }
    setLoading(false);
  };

  const AuthForm = ({ isLogin }) => {
    const [formData, setFormData] = useState({
      username: "",
      email: "",
      password: "",
    });

    const handleSubmit = () => {
      handleAuth(isLogin ? "login" : "register", formData);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? "Welcome Back" : "Join Us"}
            </h1>
            <p className="text-blue-200">
              {isLogin
                ? "Sign in to analyze your resume"
                : "Create your account to get started"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="group">
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20"
                placeholder="Enter your username"
                required
              />
            </div>

            {!isLogin && (
              <div className="group">
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20"
                  placeholder="Enter your email"
                  required
                />
              </div>
            )}

            <div className="group">
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] font-medium shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </div>
              ) : isLogin ? (
                <div className="flex items-center justify-center">
                  Sign In
                  <ArrowRight className="h-5 w-5 ml-2" />
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Create Account
                  <ArrowRight className="h-5 w-5 ml-2" />
                </div>
              )}
            </button>
          </div>

          <p className="text-center mt-6 text-blue-200">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setCurrentView(isLogin ? "register" : "login")}
              className="text-white hover:text-blue-300 font-medium transition-colors duration-300"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    );
  };

  const FileUploadArea = () => {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    };

    const handleFileSelect = (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileUpload(e.target.files[0]);
      }
    };

    return (
      <div className="text-center">
        <div
          className={`border-2 border-dashed rounded-2xl p-12 transition-all duration-300 backdrop-blur-sm ${
            dragActive
              ? "border-blue-400 bg-blue-500/20 scale-105"
              : "border-white/30 bg-white/10 hover:border-white/50 hover:bg-white/20"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <Upload className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">
            Drop your resume here
          </h3>
          <p className="text-blue-200 mb-6">or click to browse your files</p>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 cursor-pointer inline-flex items-center transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
          >
            <FileText className="h-5 w-5 mr-2" />
            Choose File
          </label>
          <p className="text-sm text-blue-300 mt-4">
            Supported formats: PDF, DOCX (Max 16MB)
          </p>
        </div>
      </div>
    );
  };

  const SkillsChart = ({ skills }) => {
    const categories = Object.keys(skills).filter(
      (key) => key !== "total_count"
    );

    const chartData = categories.map((category) => ({
      name:
        category.replace("_", " ").charAt(0).toUpperCase() +
        category.replace("_", " ").slice(1),
      value: skills[category].length,
      skills: skills[category],
    }));

    const COLORS = [
      "#8B5CF6",
      "#06B6D4",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#EC4899",
    ];

    return (
      <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
        <h3 className="text-xl font-semibold mb-6 flex items-center text-white">
          <BarChart3 className="mr-3 h-6 w-6 text-blue-400" />
          Technical Skills Distribution
          <span className="ml-auto bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
            {skills.total_count} total
          </span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)", // Dark blue instead of pure black
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    color: "white",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                  }}
                  labelStyle={{ color: "white" }}
                  itemStyle={{ color: "#E2E8F0" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {categories.map((category, index) => (
              <div
                key={category}
                className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white font-medium capitalize flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    {category.replace("_", " ")}
                  </span>
                  <span className="text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full text-sm">
                    {skills[category].length}
                  </span>
                </div>
                {skills[category].length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills[category].slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-200 text-xs px-2 py-1 rounded-lg border border-white/10"
                      >
                        {skill}
                      </span>
                    ))}
                    {skills[category].length > 3 && (
                      <span className="text-xs text-blue-300 px-2 py-1">
                        +{skills[category].length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const AnalysisView = ({ analysis }) => {
    if (!analysis || !analysis.experience_analysis) {
      return (
        <div className="text-white text-center">
          Analysis data not available.
        </div>
      );
    }
    const getScoreColor = (score) => {
      if (score >= 80) return "from-green-500 to-emerald-600";
      if (score >= 60) return "from-yellow-500 to-orange-600";
      return "from-red-500 to-pink-600";
    };

    const getScoreIcon = (score) => {
      if (score >= 80) return <Award className="h-8 w-8" />;
      if (score >= 60) return <Target className="h-8 w-8" />;
      return <TrendingUp className="h-8 w-8" />;
    };

    return (
      <div className="space-y-8">
        {/* Overall Score Card */}
        <div
          className={`backdrop-blur-sm bg-gradient-to-r ${getScoreColor(
            analysis.overall_score
          )} rounded-2xl p-8 text-white relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center mb-4">
              {getScoreIcon(analysis.overall_score)}
            </div>
            <div className="text-5xl font-bold mb-2">
              {analysis.overall_score}
              <span className="text-2xl opacity-80">/100</span>
            </div>
            <p className="text-xl opacity-90">Overall Resume Score</p>
            <div className="mt-6 h-2 bg-white/20 rounded-full">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${analysis.overall_score}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Skills Analysis */}
        <SkillsChart skills={analysis.skills} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <Zap className="h-8 w-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">
                {analysis.experience_analysis.action_words_count}
              </span>
            </div>
            <p className="text-blue-200">Action Words</p>
          </div>

          <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold text-white">
                {analysis.experience_analysis.quantifiable_achievements}
              </span>
            </div>
            <p className="text-blue-200">Achievements</p>
          </div>

          <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                {analysis.readability_score.toFixed(1)}
              </span>
            </div>
            <p className="text-blue-200">Readability</p>
          </div>

          <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <Brain className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">
                {Object.keys(analysis.word_frequency).length}
              </span>
            </div>
            <p className="text-blue-200">Keywords</p>
          </div>
        </div>

        {/* Missing Sections */}
        {analysis.missing_sections.length > 0 && (
          <div className="backdrop-blur-sm bg-red-500/10 rounded-2xl p-6 border border-red-500/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center text-red-300">
              <AlertCircle className="mr-3 h-6 w-6" />
              Missing Sections
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {analysis.missing_sections.map((section) => (
                <div
                  key={section}
                  className="bg-red-500/20 text-red-200 px-4 py-2 rounded-xl capitalize border border-red-500/30"
                >
                  {section}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Words */}
        {analysis.experience_analysis.action_words.length > 0 && (
          <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center text-white">
              <Star className="mr-3 h-6 w-6 text-yellow-400" />
              Action Words Found
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.experience_analysis.action_words
                .slice(0, 15)
                .map((word) => (
                  <span
                    key={word}
                    className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-200 px-3 py-2 rounded-lg border border-white/10 hover:from-green-500/30 hover:to-blue-500/30 transition-all duration-300"
                  >
                    {word}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center text-white">
              <CheckCircle className="mr-3 h-6 w-6 text-green-400" />
              Recommendations for Improvement
            </h3>
            <div className="space-y-4">
              {analysis.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4">
                    {index + 1}
                  </div>
                  <span className="text-blue-100">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Keywords */}
        <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold mb-6 flex items-center text-white">
            <Brain className="mr-3 h-6 w-6 text-purple-400" />
            Top Keywords
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(analysis.word_frequency)
              .slice(0, 12)
              .map(([word, count]) => (
                <div
                  key={word}
                  className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 border border-white/10"
                >
                  <div className="font-bold text-white text-lg">{count}</div>
                  <div className="text-sm text-blue-200 capitalize">{word}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const Dashboard = () => {
    if (!isInitialized) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 backdrop-blur-xl bg-white/10 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex items-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-white">
                    Resume Analyzer
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-blue-200 bg-white/10 px-4 py-2 rounded-lg">
                      <User className="h-5 w-5 mr-2" />
                      <span>{user.username}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center text-blue-200 hover:text-red-300 transition-colors bg-white/10 px-4 py-2 rounded-lg hover:bg-red-500/20"
                    >
                      <LogOut className="h-5 w-5 mr-1" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-blue-200 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-lg hover:bg-blue-500/20"
                  >
                    <User className="h-5 w-5 mr-1" />
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === "dashboard" && token && (
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Analyze Your Resume with AI
                </h2>
                <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
                  Get detailed insights, skill analysis, and personalized
                  recommendations to make your resume stand out
                </p>
              </div>
              <div className="max-w-2xl mx-auto">
                <FileUploadArea />
              </div>
              {analyses.length > 0 && token && (
              <div className="mt-16">
                <h3 className="text-3xl font-bold text-white mb-8 text-center">
                  Your Analysis History
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-white truncate text-lg">
                          {analysis.filename}
                        </h4>
                        <button
                          onClick={() => {
                            setSelectedAnalysis(analysis);
                            setCurrentView("analysis");
                          }}
                          className="text-blue-300 hover:text-white transition-colors bg-blue-500/20 p-2 rounded-lg hover:bg-blue-500/40"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="text-sm text-blue-300 mb-4 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          {analysis.analysis.overall_score}/100
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            analysis.analysis.overall_score >= 80
                              ? "bg-green-500/20 text-green-300"
                              : analysis.analysis.overall_score >= 60
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {analysis.analysis.overall_score >= 80
                            ? "Excellent"
                            : analysis.analysis.overall_score >= 60
                            ? "Good"
                            : "Needs Work"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>
          )}

          {currentView === "analysis" && selectedAnalysis && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">
                  Analysis Results
                </h2>
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className="bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20 flex items-center"
                >
                  <ArrowRight className="h-5 w-5 mr-2 rotate-180" />
                  Back to Dashboard
                </button>
              </div>
              <AnalysisView analysis={selectedAnalysis} />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Auto-dismissing Toast Messages
  const MessageDisplay = () => {
    if (!error && !success) return null;

    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {error && (
          <div className="backdrop-blur-xl bg-red-500/90 text-white px-6 py-4 rounded-xl shadow-2xl border border-red-400/50 animate-slide-in-right">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <span className="font-medium">{error}</span>
              <button
                onClick={() => setError("")}
                className="ml-4 text-white/80 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/60 rounded-full animate-shrink-width"></div>
            </div>
          </div>
        )}
        {success && (
          <div className="backdrop-blur-xl bg-green-500/90 text-white px-6 py-4 rounded-xl shadow-2xl border border-green-400/50 animate-slide-in-right">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <span className="font-medium">{success}</span>
              <button
                onClick={() => setSuccess("")}
                className="ml-4 text-white/80 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/60 rounded-full animate-shrink-width"></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Don't render anything until initialization is complete
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Main App Render
  if (!token) {
    return (
      <>
        <MessageDisplay />
        {currentView === "login" ? (
          <AuthForm isLogin={true} />
        ) : (
          <AuthForm isLogin={false} />
        )}
        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          @keyframes slide-in-right {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes shrink-width {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .animate-slide-in-right {
            animation: slide-in-right 0.3s ease-out;
          }
          .animate-shrink-width {
            animation: shrink-width 4s linear;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <MessageDisplay />
      <Dashboard />
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes shrink-width {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        .animate-shrink-width {
          animation: shrink-width 4s linear;
        }
      `}</style>
    </>
  );
};

export default App;
