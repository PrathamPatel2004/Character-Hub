import { Toaster, toast } from 'react-hot-toast';
import CloseIcon from '@mui/icons-material/Close';

const CustomToaster = () => {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
                duration: 4000,
                style: {
                    padding: 0,
                    background: 'transparent',
                    boxShadow: 'none',
                },
                success: {
                    iconTheme: {
                        primary: '#4ade80',
                        secondary: '#ecfdf5',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#f87171',
                        secondary: '#fef2f2',
                    },
                },
            }}
        >
            {(t) => (
                <div
                    className={`flex justify-between items-center w-[25vw] gap-4 bg-white shadow-md rounded-md p-4 transform transition-all duration-300
                        ${t.visible ? 'translate-x-0 opacity-100 ease-out' : 'translate-x-full opacity-0 ease-in'}
                    `}
                >
                    <div className="text-gray-800 text-sm font-medium">{t.message}</div>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                        <CloseIcon fontSize="small" />
                    </button>
                </div>
            )}
        </Toaster>
    );
};

export default CustomToaster;