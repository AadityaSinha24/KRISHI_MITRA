import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../store/authSlice";
import api, { getErrorMessage } from "../conf/api";
import MENU from "../conf/menu";
import useSpeech from "../conf/useSpeech";
import Numpad from "../components/Numpad";
import { logoutUser } from "../services/authService";
import getErrorMessage from "../utils/getErrorMessage";


export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { speak, stop, speaking, supported, hasVoice } = useSpeech("hi-IN");

  const [digits, setDigits] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuIndex, setMenuIndex] = useState(-1); // item being read right now
  const menuRun = useRef(0);

  const stopAll = () => {
    menuRun.current++; // cancels the menu loop
    stop();
    setMenuIndex(-1);
  };

  // read the menu one item at a time
  const playMenu = async () => {
    stopAll();
    const run = ++menuRun.current;
    for (let i = 0; i < MENU.length; i++) {
      if (run !== menuRun.current) return;
      setMenuIndex(i);
      await speak(`${MENU[i].key} दबाइए, ${MENU[i].label}`);
      await new Promise((r) => setTimeout(r, 400));
    }
    if (run === menuRun.current) setMenuIndex(-1);
  };

  const onDigit = (d) => setDigits((p) => (p.length < 2 ? p + d : p));
  const onBack = () => setDigits((p) => p.slice(0, -1));

  const onSubmit = async () => {
    const n = parseInt(digits, 10);
    if (!(n >= 1 && n <= MENU.length)) {
      setError(`1 से ${MENU.length} के बीच नंबर दबाइए`);
      return;
    }
    stopAll();
    setError("");
    setAnswer("");
    setLoading(true);
    try {
      const res = await api.post("/prompt", { key: String(n) });
      const text = res.data.data.text;
      setAnswer(text);
      setDigits("");
      speak(text);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onLogout = async () => {
    stopAll();
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">नमस्ते, {user.fullname}</h1>
          <button onClick={onLogout} className="rounded bg-red-600 px-3 py-1 text-sm text-white">
            Logout
          </button>
        </div>

        {supported && !hasVoice && (
          <p className="rounded bg-yellow-100 p-2 text-sm text-yellow-800">
            इस डिवाइस पर हिंदी आवाज़ नहीं मिली। आवाज़ साफ़ न आए तो डिवाइस में Hindi voice इंस्टॉल करें।
          </p>
        )}
        {!supported && (
          <p className="rounded bg-yellow-100 p-2 text-sm text-yellow-800">
            यह ब्राउज़र आवाज़ (speech) सपोर्ट नहीं करता।
          </p>
        )}

        {/* menu */}
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">मेनू</h2>
            <button
              onClick={menuIndex >= 0 ? stopAll : playMenu}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
            >
              {menuIndex >= 0 ? "⏹ रोकें" : "🔊 मेनू सुनें"}
            </button>
          </div>
          <ul className="space-y-1">
            {MENU.map((m, i) => (
              <li
                key={m.key}
                onClick={() => setDigits(m.key)}
                className={`cursor-pointer rounded px-2 py-1 ${
                  i === menuIndex ? "bg-yellow-200 font-semibold" : "hover:bg-gray-100"
                }`}
              >
                {m.key}. {m.label}
              </li>
            ))}
          </ul>
        </div>

        {/* display + numpad */}
        <div className="rounded-lg bg-white p-4 shadow space-y-3">
          <div className="h-14 rounded bg-gray-900 px-4 text-right text-3xl leading-[3.5rem] text-green-400">
            {digits || "—"}
          </div>
          <Numpad onDigit={onDigit} onBack={onBack} onSubmit={onSubmit} disabled={loading} />
        </div>

        {error && <p className="rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>}
        {loading && <p className="text-center text-gray-600">जवाब आ रहा है...</p>}

        {/* answer */}
        {answer && (
          <div className="rounded-lg bg-white p-4 shadow space-y-3">
            <p className="whitespace-pre-wrap text-lg leading-relaxed">{answer}</p>
            <button
              onClick={speaking ? stop : () => speak(answer)}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
            >
              {speaking ? "⏹ रोकें" : "🔊 फिर से सुनें"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}