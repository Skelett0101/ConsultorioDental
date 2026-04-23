package mx.com.ubam.dto;

public class PasswordDTO {
    
    private String passwordActual;
    private String passwordNueva;

   
    public String getPasswordActual() {
        return passwordActual;
    }

    public String getPasswordNueva() {
        return passwordNueva;
    }

    
    public void setPasswordActual(String passwordActual) {
        this.passwordActual = passwordActual;
    }

    public void setPasswordNueva(String passwordNueva) {
        this.passwordNueva = passwordNueva;
    }
}