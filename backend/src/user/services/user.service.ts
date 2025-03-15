import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UserI } from '../interfaces/user.interfaces';
import { AuthService } from 'src/auth/services/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly authService: AuthService
  ) {}

  async create(userEntity: UserI): Promise<UserI> {

    const checkMail: boolean = await this.emailExist(userEntity.email);
    const checkUsername: boolean = await this.usernameExist(userEntity.username);

    console.log(checkMail,checkUsername);
    
    if (!checkMail && !checkUsername) {

      const hashPassword = await this.authService.hashPassword(userEntity.password ?? '');
      userEntity.password = hashPassword;

      return await this.userRepository.save(this.userRepository.create(userEntity));
    } else {
      throw new HttpException('Email and Username Exist', HttpStatus.CONFLICT);
    }
  }

  async login(userEntity: UserI): Promise<string> {

    const foundUser = await this.findByEmail(userEntity.email);

    if (!!foundUser && userEntity.password && foundUser.password) {

      if (await this.authService.comparePassword(userEntity.password, foundUser.password)) {

        return await this.authService.generateToken(foundUser);
      }
    }
    
    throw new UnauthorizedException();
  }

  private async findByEmail(email: string | undefined): Promise<UserI | null> {
    const user = await this.userRepository.findOne({
      where: {email},
      select: ['email', 'id', 'password', 'username']
    });
    
    if (user) {
      return {
        email: user.email,
        id: user.id,
        password: user.password,
        username: user.username
      }
    }

    return null;
  }

  private async emailExist(email: string | undefined): Promise<boolean> {
    const user = await this.userRepository.findOne( {where: {email}});
    console.log(user);
    
    return !!user;
  }

  private async usernameExist(username: string | undefined): Promise<boolean> {
    const user = await this.userRepository.findOne( {where: {username}});
    console.log(user);

    return !!user;
  }
}
