import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import XSvg from "../../components/X";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import toast from "react-hot-toast";

interface ResetPasswordState {
  newPassword: string;
  confirmPassword: string;
  token: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ResetPasswordState>({
    newPassword: "",
    confirmPassword: "",
    token: "",
  });

  // Check for token on component mount
  useEffect(() => {
    const resetToken = sessionStorage.getItem("resetToken");
    if (resetToken) {
      setFormData((prev) => ({ ...prev, token: resetToken }));
    } else {
      navigate("/forgot-password");
      toast.error("Password reset session expired. Please start again.");
    }
  }, [navigate]);

  const { mutate: resetPasswordMutation, isPending } = useMutation({
    mutationFn: async ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => {
      try {
        const res = await axios.post(
          "/api/auth/reset-password",
          { token, newPassword },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        return res.data;
      } catch (error) {
        if (isAxiosError(error)) {
          const errorMsg =
            error.response?.data?.message || "Failed to reset password";
          toast.error(errorMsg);
        } else {
          console.error(error);
          toast.error("An unexpected error occurred");
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Password reset successful");
      // Clear session storage items
      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("resetToken");

      // Update auth state
      queryClient.invalidateQueries({ queryKey: ["authUser"] });

      // Redirect to home page
      navigate("/");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate passwords
    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    resetPasswordMutation({
      token: formData.token,
      newPassword: formData.newPassword,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="w-full h-screen flex bg-black text-white">
      {/* Left Panel with Logo - Hidden on mobile, 50% on desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 items-center justify-center relative overflow-hidden">
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <XSvg className="w-2/3 fill-zinc-800" />
      </div>

      {/* Right Panel - Full width on mobile, 50% on desktop */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center lg:items-start">
            <XSvg className="w-12 h-12 lg:hidden fill-white mb-6" />
            <h1 className="text-3xl font-bold tracking-tight">
              Create new password
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Your password must be at least 8 characters
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-zinc-400"
                >
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 bg-zinc-900 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-zinc-700 focus:ring-2 focus:ring-zinc-500 focus:outline-none sm:text-sm sm:leading-6"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-zinc-400"
                >
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 bg-zinc-900 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-zinc-700 focus:ring-2 focus:ring-zinc-500 focus:outline-none sm:text-sm sm:leading-6"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="loading loading-spinner loading-sm"></span>
                      Resetting password...
                    </span>
                  ) : (
                    "Reset password"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="text-sm font-semibold text-zinc-400 hover:text-white"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
