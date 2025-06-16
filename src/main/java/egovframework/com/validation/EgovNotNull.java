package egovframework.com.validation;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = EgovValidation.class)
@Documented
public @interface EgovNotNull {

    String message() default "";
    Class<?>[] groups() default { };
    Class<? extends Payload>[] payload() default { };

}
