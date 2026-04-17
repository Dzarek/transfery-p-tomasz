type ContextTypes = {
  activeUser: any;
  name: string;
  isLogin: boolean;
  loading: boolean;
  email: string;
  modalName: boolean;
  setIsLogin: (isLogin: boolean) => void;
  setName: (name: string) => void;
  setModalName: (modalName: boolean) => void;
  setLoading: (loading: boolean) => void;
  //   file: any;
  //   setFile: (file: any) => void;
};
