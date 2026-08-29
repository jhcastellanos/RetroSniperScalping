export class AppError extends Error {
  readonly code: string;

  constructor(message: string, code = "APP_ERROR") {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export const ErrorMessages = {
  notAuthenticated: "Debes iniciar sesión para continuar.",
  notAuthorized: "No tienes autorización para esta acción.",
  emailTaken: "Este correo ya está registrado.",
  invalidCredentials: "El correo o la contraseña no son correctos.",
  passwordsDoNotMatch: "Las contraseñas no coinciden.",
  challengeNotStarted: "El reto todavía no ha comenzado.",
  challengeAlreadyStarted: "El reto ya fue iniciado.",
  challengeNotRegistration: "El reto no está abierto para inscripción.",
  challengeNotActive: "El reto no está activo.",
  challengeCompleted: "El reto ya terminó. No se aceptan nuevos resultados.",
  notRegistered: "No estás inscrito en este reto.",
  marketClosed: "Hoy no es un día de mercado.",
  notTradingDayToStart: "Hoy no es un día de negociación del mercado de EE. UU.",
  invalidBalance: "El balance debe ser mayor o igual a $0.",
  noParticipants: "Necesitas al menos un participante para iniciar el reto.",
  alreadyJoined: "Ya estás inscrito en este reto.",
  cannotJoin: "Este reto ya no acepta inscripciones.",
  dayNotOpen: "No hay un día abierto para cargar resultados.",
  dayAlreadyClosed: "Este día ya fue cerrado.",
  imageType: "Solo se permiten imágenes JPG, PNG o WEBP.",
  imageSize: "La imagen no puede superar los 2 MB.",
  imageStorage: "El almacenamiento de fotos no está configurado en el servidor.",
  challengeDeleted: "El reto fue eliminado y todas las inscripciones se cancelaron.",
} as const;

export function getErrorMessage(error: unknown, fallback = "Ocurrió un error. Inténtalo de nuevo.") {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}
