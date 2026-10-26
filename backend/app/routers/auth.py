from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth import create_access_token, get_current_user, hash_password, verify_password
from app.database import get_db
from app.db_models import UserDB
from app.models import Token, User, UserCreate

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(UserDB).filter(UserDB.username == user_in.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    pwd_hash, salt = hash_password(user_in.password)
    user_db = UserDB(
        username=user_in.username,
        hashed_password=pwd_hash,
        salt=salt,
        is_active=True,
    )
    db.add(user_db)
    db.commit()
    db.refresh(user_db)
    return user_db


@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(UserDB).filter(UserDB.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password, user.salt):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return Token(access_token=access_token, token_type="bearer")


@router.post("/login", response_model=Token)
def login_json(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.username == user_in.username).first()
    if not user or not verify_password(user_in.password, user.hashed_password, user.salt):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=User)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
